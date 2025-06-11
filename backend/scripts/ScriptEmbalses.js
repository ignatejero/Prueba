const axios = require('axios');
const sequelize = require('../config/database');
const Embalse = require('../models/Embalse');
const ResumenEmbalses = require('../models/ResumenEmbalses');
const HistorialEmbalses = require('../models/HistorialEmbalses');
const HistorialResumenEmbalses = require('../models/HistorialResumenEmbalses');

const embalses_hm3 = {
  // Tus URLs de volumen (hm³)
};

const embalses_porcentaje = {
  // Tus URLs de porcentaje (%)
};

async function actualizarEmbalses() {
  console.time("Tiempo de ejecución");

  let volumenTotal = 0;
  let CapacidadTotal = 0;
  let embalsesProcesados = 0;
  const capacidadMaxima = 1060.7;

  for (let nombreEmbalse in embalses_hm3) {
    try {
      console.log(`📥 Descargando datos para el embalse: ${nombreEmbalse}`);

      const response_hm3 = await axios.get(embalses_hm3[nombreEmbalse], { maxRedirects: 5 });
      const capacidad = response_hm3.data.response?.valores?.at(-1)?.valor ?? null;

      console.log(`📊 Volumen en hm³ para ${nombreEmbalse}: ${capacidad}`);

      const response_porcentaje = await axios.get(embalses_porcentaje[nombreEmbalse], { maxRedirects: 5 });
      const volumen_porcentual = response_porcentaje.data.response?.valores?.at(-1)?.valor ?? null;

      console.log(`📊 Volumen porcentual para ${nombreEmbalse}: ${volumen_porcentual}%`);

      if (capacidad !== null && volumen_porcentual !== null) {
        volumenTotal += capacidad * (volumen_porcentual / 100);
        CapacidadTotal += capacidad;
        embalsesProcesados++;
      }

      console.log('Buscando embalse con nombre:', nombreEmbalse);

      const embalseEnDb = await Embalse.findOne({ where: { nombre: nombreEmbalse } });
      if (embalseEnDb) {
        await embalseEnDb.update({ capacidad, volumen_porcentual });
        console.log(`✅ Embalse ${nombreEmbalse} actualizado.`);

        await HistorialEmbalses.create({
          nombre: nombreEmbalse,
          capacidad,
          volumen_porcentual,
          fecha_registro: new Date()
        });

        console.log(`📜 Historial actualizado para ${nombreEmbalse}.`);
      }
    } catch (error) {
      console.error(`❌ Error en ${nombreEmbalse}: ${error.message}`);
    }
  }

  if (embalsesProcesados === 0) {
    console.warn("⚠️ No se procesó ningún embalse (todos fallaron). No se actualiza resumenembalses.");
    return;
  }

  const PorcentajeTotal = CapacidadTotal === 0 ? 0 : (volumenTotal / CapacidadTotal) * 100;

  console.log(`📊 Volumen total en todos los embalses: ${CapacidadTotal.toFixed(2)} hm³`);
  console.log(`📊 Porcentaje total de llenado: ${PorcentajeTotal.toFixed(2)}%`);

  const resumenEnDb = await ResumenEmbalses.findOne({ where: { id: 1 } });
  if (resumenEnDb) {
    await resumenEnDb.update({ CapacidadTotal, PorcentajeTotal });
    console.log(`📌 Resumen de embalses actualizado.`);
  }

  await HistorialResumenEmbalses.create({
    CapacidadTotal,
    PorcentajeTotal,
    fecha_registro: new Date()
  });

  console.log('🎉 Actualización completada.');
  console.timeEnd("Tiempo de ejecución");
}

// Programar ejecución cada 15 minutos
setInterval(() => {
  console.log("⏰ Ejecutando actualización programada...");
  actualizarEmbalses();
}, 15 * 60 * 1000);

// Primera ejecución inmediata
actualizarEmbalses();
