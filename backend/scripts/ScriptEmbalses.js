const axios = require('axios');
const sequelize = require('../config/database');
const Embalse = require('../models/Embalse');
const ResumenEmbalses = require('../models/ResumenEmbalses');
const HistorialEmbalses = require('../models/HistorialEmbalses'); // Importamos el modelo
const HistorialResumenEmbalses = require('../models/HistorialResumenEmbalses'); // Importamos el modelo


// Enlaces para cada embalse
const embalses_hm3 = {
    'Pinilla': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMMr0Hu504kxzGBq45xmUA0JhPT11sTdaV5IRKiqDBxgHkl04y0wc63xJGR5qVVSbDGJCxV3y9CkxX8piPOjjJGB',
    'Riosequillo': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMP8Pm9KIGuXZQlhejg%2BlPuLtWj0CjPyUifSUDJIOnjF6xrrRL2YcJFTpQAQUOILe%2FWowfMl2xOlnHm4bvzXwC%2Bv',
    'Puentes Viejas': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMN5469IYU%2FruTH03AF0AEUHRJgkmRP6V4Wl1sXkK%2Bk64brzisvFZez1vZXxim7c9hkKC4SPedZxjHDp%2B%2FPNof%2Bv',
    'El Villar': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMOEzriDe0sQslQQa2HUca9%2FPs0L9Wg8r8B7z0Gn1FBY5J5sqNt%2BBjzmgN8Dz5PoohxQm%2BJOb4QKep%2FqBC%2BRfA41',
    'El Atazar': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMMRqHK5Qnu4AyxXvjcjSIkxMW%2Fs9RYFE775pc7CZqo5I%2FIh3MBBtxx9Rmbvm9rNvFH0CCkap4NDeW9qmJLZUJTJ',
    'Pedrezuela': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMPUzQH3%2B0KKGyvXh7qzwCAPjvXCiGzv09JS7HVqqNpdd5nEM9dKpv26ABT6bHWuC%2B24CO26h7osjd7SGjucxhL4',
    'Santillana': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMMYjSvtPkM0SPlfN2kvQ5qmUclGiZcV9Y4t6%2FUubPDm%2FVk4sQwqsLykouSigTlx6A4qb%2FQAeAy9l6suF9XRtZ4X',
    'Navacerrada': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMNDZAgvCAyo4dPUmz%2FG%2Fnk%2BURWLtL9A9IVnDzoEjpGtBrjIyM%2FH38%2FFaYI4S7XHFEiZg0JWEly0JoqyrlCoZ2Dt',
    'Navalmedio': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMMZ2OpBT1r19WYo21QH4mrU5Mg1ty%2FlKVgT15wO0co%2BnzkBPgOYq43RsGFcuQ%2FRzry7QcgWq0JS235vegtXU%2BBv',
    'La Jarosa': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMMS68K92ke9TGTdZ1gejcvDLG4IQaKcQgHfq8Qh6%2BUSb2OW9aYzQU1riiJfN8PDBXZjoMvXBt13dGTozI91k%2FyH',
    'Valmayor': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMNWHKajgy8hoWMUTluUr%2BPRU1xGcmcZWmrCju4lWH6ZUqI4GYC0%2FHofsEaus%2FbYvXxjrCF4Lr3mfyWtI2OpJ5tu',
    'El Pardo': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMP7K3WgzuI%2BprHXL%2F0Yvupm7RukZRGSKdCH1bLr0KY2ja0%2B%2BJm2mSKLBrSDqrSQI1VKcY6F9woqLqxkNAdn2sLd',
    'San Juan': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMMDXh%2FKltFCJMWvJi7x%2Fs9bsLnSeMx9iEpQtBc3ZY%2FgyAfM6P3nGRLazVQ%2FiTzNP2jPh0BHCesrl%2F52I9htRAtA',
    'Picadas': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMPeNZ0RFNDBWuUloNaSOq4rrI3WniQTj291KM0kkpL7LnJ6Pg761Vr%2BK8QZCR7%2BhqWDJ7BQXSnBVfIT4rvL8S1V'
  };

// Enlaces para el volumen porcentual
const embalses_porcentaje = {
    'Pinilla': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMPPLfVNyPsNXvn4ACaCNMF6L2YLv8PRPwGCRuXBb4MqH9mxadeaFLqFVI3yEsprOe%2BsJzxQy2Hc2GxqkFJqDx%2BO',
    'Riosequillo': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMPzK%2BkeMIXA1UYQwNaBhczYFtbCphgsLaQEq5mEHjlymtdf67fXgdp%2BgQq4NnrqvJZyOaXjatV6FLRZ9ybnvALr',
    'Puentes Viejas': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMPynF42j7Rx5HOVGrZVTuwKduMY8AgslChk3IveSr%2BGMqtzRO3GgIRDrF4dHXr3zkMkoUQO0p%2B0O2cR4AMSJOlv',
    'El Villar': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMPJaNGFyuGGAFc9hSJgo7wBztudFWEnvT%2BOlIKzZxTsMs9IRwT49W9kcCK8milanE80vSYokTMhfyPgWvl5Ojr7',
    'El Atazar': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMNx3ExthyNRIVtt4CFGXxQWzQOwdXhA%2BC%2F5eLa1rQz0yz86lYQdx%2F3Nfoho5669ma9kRnmr3TX8q4VRdB%2FOT7%2Fh', 
    'Pedrezuela': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMNHCQBiCn6P9s1H4noSSSlbE%2FtKDsF32FbupzaKrbHGHglReOSe9%2FgePhYhMOKRoqtYjnd0J6CJrNpomL4dK1l3',
    'Santillana':'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMMq6qbuVa5S1ZrFv%2BtMe58UdlJV%2FApJIQTphGDE5IhhlW%2BkFvQYEVECA%2FhzavBdpSLeU1k1ZzhkZsUQ3xXF%2F8oe',
    'Navacerrada': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMM%2BHunBxrjEpPvrWN53V5pumjlTdyJLoYAA37tZV1XYszkzCi1IERneJN89KpJt7lzepm82nr%2F0o4zedgB%2BlpG%2B',
    'Navalmedio':'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMNj9cN8MK2t%2F5wpVE6EPANxbk16Rg8KDgEc%2BvSAlBoWB9r0xCHZTgVZXsPVBaBzVXxz1n00KSYzQEPWH47%2FL0v%2B',
    'La Jarosa': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMOBEVhk8PwM5cXAKmOvdB7zVQXrwBVK4CbP%2BNrgYYrVkhvoH%2BKA38qbeh9DvJvqlZ%2BKudKZ8tLbqzyAevcbbSHs',
    'Valmayor': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMPzKm05UXdIkjyiynp61XzKc63CnjVjWiufa8B%2B2%2FlQpRIVjwMi0H6c0iTIaYqMcNbsUXxQKw0kHXyzSWPYyrWL',
    'El Pardo': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMOUN9BkQe5YtGWJ%2BopVndtQpVON%2BG%2BbQsDHngKsqpOOQSZF7wcLGS%2FMO9EYNesbqi8W9IOZUjFfJUruYbknZgve',
    'San Juan': 'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMMpw0vljEaMwGVXFsxP4ZkeHRHtnqBe1sO5CyLBNIz1V5DD5U33uFz8Qyfr69l1qjZdl7vFhEUvXdH%2B%2FhieJoQ7',
    'Picadas':'https://saihtajo.chtajo.es/index.php?w=get-export-json&x=tdvLPHraKtQITRYUL%2F%2BeuLeudeKdeAnwJWjKU%2B6GOMNH5WGazkxB4HGdgdzPlsgJJE%2FvuKfq%2Bq4kzx%2Fn%2BmjOWGy4om5OPcoXvujaL403uK%2F%2B99705vzkg2VK5Eph9BGv'

};

let enEjecucion = false;

async function actualizarEmbalses() {

    console.time("Tiempo de ejecución");
    let CapacidadTotal = 0;
    let capacidadMaxima = 1060.7; // Capacidad Máxima de los embalses

    for (let nombreEmbalse in embalses_hm3) {
        try {
            console.log(`📥 Descargando datos para el embalse: ${nombreEmbalse}`);

            const response_hm3 = await axios.get(embalses_hm3[nombreEmbalse]);
            const data_hm3 = response_hm3.data.response;
            const ultimoDato_hm3 = data_hm3?.valores?.at(-1);
            const capacidad = ultimoDato_hm3?.valor ?? null;

            console.log(`📊 Volumen en hm³ para ${nombreEmbalse}: ${capacidad}`);

            const response_porcentaje = await axios.get(embalses_porcentaje[nombreEmbalse]);
            const data_porcentaje = response_porcentaje.data.response;
            const ultimoDato_porcentaje = data_porcentaje?.valores?.at(-1);
            const volumen_porcentual = ultimoDato_porcentaje?.valor ?? null;

            console.log(`📊 Volumen porcentual para ${nombreEmbalse}: ${volumen_porcentual}%`);

            if (capacidad !== null && volumen_porcentual !== null && volumen_porcentual > 0) {
                CapacidadTotal += capacidad;
            }

            console.log('Buscando embalse con nombre:', nombreEmbalse);


            // Buscamos en la base de datos cada embalse por su nombre
            const embalseEnDb = await Embalse.findOne({ where: { nombre: nombreEmbalse } });
            if (embalseEnDb) {
                // Si el embalse está en la base de datos, se actualiza la capacidad y el volumen porcentual
                await embalseEnDb.update({ capacidad, volumen_porcentual });
                console.log(`✅ Embalse ${nombreEmbalse} actualizado.`);

                // Guardamos el historial de cada embalse por su hora de registro para analizar registros históricos.
                await HistorialEmbalses.create({
                    nombre: nombreEmbalse,
                    capacidad,
                    volumen_porcentual,
                    fecha_registro: new Date()
                });
                
                console.log(`📜 Historial actualizado para ${nombreEmbalse}.`);
            }
        } catch (error) {
            console.error(`❌ Error en ${nombreEmbalse}:`, error);
        }
    }

    const PorcentajeTotal = (CapacidadTotal / capacidadMaxima) * 100; // Calculamos el porcentaje de llenado

    console.log(`📊 Volumen total en todos los embalses: ${CapacidadTotal.toFixed(2)} hm³`);
    console.log(`📊 Porcentaje total de llenado: ${PorcentajeTotal.toFixed(2)}%`);


    const resumenEnDb = await ResumenEmbalses.findOne({ where: { id: 1 } });
    if (resumenEnDb) {
        // Si el id está en la base de datos, se actualiza la capacidadTotal y el PorcentajeTotal
        await resumenEnDb.update({ CapacidadTotal, PorcentajeTotal });
        console.log(`📌 Resumen de embalses actualizado.`);
    }

    // Guardamos el historial de la totalidad de los embalses por su hora de registro para analizar registros históricos.
    await HistorialResumenEmbalses.create({
        CapacidadTotal,
        PorcentajeTotal,
        fecha_registro: new Date()
    });

    console.log('🎉 Actualización completada.');
    console.timeEnd("Tiempo de ejecución");
}

// Ejecutamos la actualización cada 15 minuto
setInterval(actualizarEmbalses, 15 * 60 * 1000);
actualizarEmbalses();