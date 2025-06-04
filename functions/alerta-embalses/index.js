// functions/alertas-embalses/index.js

require('dotenv').config();
const axios       = require('axios');
const { Pool }    = require('pg');

// -----------------------------------------------------------------------------
// NOTA IMPORTANTE:
// En lugar de hardcodear host: 'localhost', user: 'postgres', etc.,
// se recomienda usar variables de entorno para producción.
// Asume que, en la sección “Settings → Environment Variables” de tu Function,
// ya has configurado:
//   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, 
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// -----------------------------------------------------------------------------

// Inicializamos el pool de Postgres usando variables de entorno:
const pool = new Pool({
  user:     process.env.DB_USER,        
  host:     process.env.DB_HOST,        
  database: process.env.DB_NAME,        
  password: process.env.DB_PASSWORD,    
  port:     process.env.DB_PORT,        
  ssl:      process.env.DB_SSL === 'true' 
             ? { rejectUnauthorized: false } 
             : false
});

const NIVEL_CRITICO_EMBALSE  = 30;
const NIVEL_CRITICO_EMBALSES = 50;
const botToken               = process.env.TELEGRAM_BOT_TOKEN;
const chatId                 = process.env.TELEGRAM_CHAT_ID;

// Función para enviar alerta de un embalse individual
const enviarAlertaTelegramEmbalse = async (embalse) => {
  const mensaje = `⚠️⚠️ *Alerta capacidad de Embalses* ⚠️⚠️\n\n` +
                  `🚨🚨URGENTE🚨🚨\n\n` +
                  `El embalse *${embalse.nombre}* ha alcanzado un nivel crítico: ${embalse.volumen_porcentual}%`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    // Envío a Telegram
    await axios.post(url, {
      chat_id:    chatId,
      text:       mensaje,
      parse_mode: "Markdown",
    });
    console.log(`✅ Alerta enviada para ${embalse.nombre}`);

    // Guardar alerta en BBDD (sin emojis)
    await pool.query(
      `INSERT INTO alertas
         (embalse_id, nombre, capacidad, volumen_porcentual, mensaje)
       VALUES (
         $1, $2, $3, $4,
         regexp_replace($5, '[^[:ascii:]]', '', 'g')
       )`,
      [
        embalse.id.toString(),
        embalse.nombre,
        embalse.capacidad,
        embalse.volumen_porcentual,
        mensaje
      ]
    );
    console.log('💾 Alerta embalse guardada en BBDD');
  } catch (error) {
    console.error("❌ Error enviando o guardando alerta:", error.message);
  }
};

// Función para enviar alerta global de todos los embalses
const enviarAlertaTelegramEmbalses = async (porcentajeTotal, capacidadTotal) => {
  const mensaje = `⚠️⚠️ *Alerta capacidad de Embalses* ⚠️⚠️\n\n` +
                  `🚨🚨URGENTE🚨🚨\n\n` +
                  `Los embalses han alcanzado un nivel crítico: ${porcentajeTotal}%`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    // Envío a Telegram
    await axios.post(url, {
      chat_id:    chatId,
      text:       mensaje,
      parse_mode: "Markdown",
    });
    console.log(`✅ Alerta global enviada`);

    // Guardar alerta global en BBDD usando la capacidad total real
    await pool.query(
      `INSERT INTO alertas
         (embalse_id, nombre, capacidad, volumen_porcentual, mensaje)
       VALUES (
         $1, $2, $3, $4,
         regexp_replace($5, '[^[:ascii:]]', '', 'g')
       )`,
      [
        'todos',
        'Resumen global',
        capacidadTotal,     // ahora no es null
        porcentajeTotal,
        mensaje
      ]
    );
    console.log('💾 Alerta global guardada en BBDD');
  } catch (error) {
    console.error("❌ Error enviando o guardando alerta global:", error.message);
  }
};

// Verifica niveles de embalses individuales
const verificarEmbalse = async () => {
  try {
    console.log("🔄 Verificando niveles de embalses...");
    const result   = await pool.query(
      "SELECT id, nombre, capacidad, volumen_porcentual FROM embalses"
    );
    const embalses = result.rows;

    for (const embalse of embalses) {
      if (embalse.volumen_porcentual < NIVEL_CRITICO_EMBALSE) {
        await enviarAlertaTelegramEmbalse(embalse);
      } else {
        console.log(`🟢 ${embalse.nombre} está en nivel normal: ${embalse.volumen_porcentual}%`);
      }
    }
  } catch (error) {
    console.error("❌ Error al verificar niveles:", error);
  }
};

// Verifica el nivel global de todos los embalses
const verificarEmbalses = async () => {
  try {
    console.log("🔄 Verificando nivel global de embalses...");
    const result = await pool.query(
      'SELECT "PorcentajeTotal", "CapacidadTotal" FROM resumenembalses'
    );
    const row = result.rows[0];
    if (!row) {
      console.error("❌ No se pudo obtener el valor de PorcentajeTotal.");
      return;
    }

    const porcentajeTotal = row.PorcentajeTotal;
    const capacidadTotal  = row.CapacidadTotal;

    if (porcentajeTotal < NIVEL_CRITICO_EMBALSES) {
      await enviarAlertaTelegramEmbalses(porcentajeTotal, capacidadTotal);
    } else {
      console.log(`🟢 Los embalses están en un nivel normal: ${porcentajeTotal}%`);
    }
  } catch (error) {
    console.error("❌ Error al verificar nivel global:", error);
  }
};

// ------------------------------------------------------------------------------------
// Esta es la función principal que DigitalOcean invocará cada vez que la “trigger” se ejecute.
// Traducimos todo a un solo handler “main” que se dispara (por ejemplo) cada 10 minutos.
// ------------------------------------------------------------------------------------
exports.main = async function main(args) {
  try {
    // Intentar “conectar” (al hacer la primera consulta el pool se conecta automáticamente):
    await pool.query('SELECT 1');
    console.log('Conexión a la base de datos exitosa');

    // Ejecutar verificaciones:
    await verificarEmbalse();
    await verificarEmbalses();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Alertas ejecutadas correctamente.' })
    };
  } catch (err) {
    console.error('❌ Error en la Function de Alertas:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Error indefinido.' })
    };
  }
};
