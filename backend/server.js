// src/server.js
require('dotenv').config();
const axios   = require('axios');
const express = require('express');
const cors    = require('cors');
const app     = express();
const sequelize = require('./config/database');
const Embalse   = require('./models/Embalse');
const ResumenEmbalses        = require('./models/ResumenEmbalses');
const HistorialEmbalses      = require('./models/HistorialEmbalses');
const HistorialResumenEmbalses = require('./models/HistorialResumenEmbalses');

/* { Pool } = require('pg');
const pool = new Pool({
  user:     'postgres',
  host:     'localhost',
  database: 'postgres',
  password: 'admin',
  port:     5432,
});*/

const { Pool } = require('pg');
const pool = new Pool({
   user: process.env.DB_USER,         
   host: process.env.DB_HOST,         
   database: process.env.DB_NAME,     
   password: process.env.DB_PASSWORD, 
   port: process.env.DB_PORT,         
   ssl: {
    rejectUnauthorized: false
   }
});


app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Conexión Sequelize
sequelize.authenticate()
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch(err => console.error('No se pudo conectar a la base de datos:', err));

// API Key de OpenWeatherMap
const apiKey = "5ae5643cc45b2312bd6eb29aea734bd5";

// Convertir tiempo Unix a hora legible
const convertirHora = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// Obtener clima actual
const obtenerPronosticoActual = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo el clima actual:', error.message);
    return null;
  }
};

// Obtener pronóstico futuro
const obtenerPronosticoFuturo = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
  try {
    const response = await axios.get(url);
    return response.data.list.slice(0, 5); // 5 predicciones
  } catch (error) {
    console.error('Error obteniendo la predicción:', error.message);
    return null;
  }
};

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor Express funcionando!');
});

// Obtener todos los embalses
app.get('/embalses', async (req, res) => {
  try {
    const embalses = await Embalse.findAll();
    res.status(200).json(embalses);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener embalses', error });
  }
});

// Obtenemos un embalse por ID
app.get('/embalses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const embalse = await Embalse.findByPk(id);
    if (!embalse) {
      return res.status(404).json({ message: 'Embalse no encontrado' });
    }
    res.status(200).json(embalse);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener embalse por ID', error });
  }
});

// Obtenemos el resumen de embalses
app.get('/resumenembalses', async (req, res) => {
  try {
    const resumen = await ResumenEmbalses.findAll();
    res.status(200).json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen de embalses:', error);
    res.status(500).json({ message: 'Error al obtener resumen de embalses', error });
  }
});

// Obtener historial de cada embalse
app.get('/historialembalses', async (req, res) => {
  try {
    const historial = await HistorialEmbalses.findAll({
      order: [['fecha_registro', 'DESC']]
    });
    res.status(200).json(historial);
  } catch (error) {
    console.error('Error al obtener historial de embalses:', error);
    res.status(500).json({ message: 'Error al obtener historial de embalses', error });
  }
});

// Obtener historial del resumen de embalses
app.get('/historialresumenembalses', async (req, res) => {
  try {
    const historialResumen = await HistorialResumenEmbalses.findAll({
      order: [['fecha_registro', 'DESC']]
    });
    res.status(200).json(historialResumen);
  } catch (error) {
    console.error('Error al obtener historial de resumen de embalses:', error);
    res.status(500).json({ message: 'Error al obtener historial de resumen de embalses', error });
  }
});

// Obtener pronósticos
app.get('/embalses/tiempo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT nombre, ST_X(ubicacion_geo) AS lon, ST_Y(ubicacion_geo) AS lat FROM embalses WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Embalse no encontrado' });
    }

    const { nombre, lat, lon } = result.rows[0];
    const climaActual = await obtenerPronosticoActual(lat, lon);
    const prediccion  = await obtenerPronosticoFuturo(lat, lon);

    if (!climaActual || !prediccion) {
      return res.status(500).json({ message: 'Error obteniendo los datos del clima' });
    }

    const climaActualData = {
      descripcion:       climaActual.weather[0].description,
      icono:             `https://openweathermap.org/img/wn/${climaActual.weather[0].icon}@2x.png`,
      temperatura:       climaActual.main.temp,
      sensacionTermica:  climaActual.main.feels_like,
      humedad:           climaActual.main.humidity,
      presion:           climaActual.main.pressure,
      viento:            `${climaActual.wind.speed} m/s, Dirección: ${climaActual.wind.deg}°`,
      amanecer:          convertirHora(climaActual.sys.sunrise),
      atardecer:         convertirHora(climaActual.sys.sunset),
    };

    const prediccionesData = prediccion.map((forecast) => ({
      fecha:              forecast.dt_txt,
      descripcion:        forecast.weather[0].description,
      icono:              `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`,
      temperatura:        forecast.main.temp,
      sensacionTermica:   forecast.main.feels_like,
      humedad:            forecast.main.humidity,
      presion:            forecast.main.pressure,
      viento:             `${forecast.wind.speed} m/s, Dirección: ${forecast.wind.deg}°`,
      lluvia:             forecast.rain ? forecast.rain['3h'] : 0,
      nubosidad:          forecast.clouds.all,
    }));

    res.json({ embalse: nombre, climaActual: climaActualData, predicciones: prediccionesData });
  } catch (error) {
    console.error('Error al obtener pronósticos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Devuelve un mapa de precipitaciones para un embalse
app.get('/embalses/:id/mapa', async (req, res) => {
  const { id } = req.params;
  try {
    const emb = await pool.query(
      `SELECT nombre, ST_X(ubicacion_geo) AS lon, ST_Y(ubicacion_geo) AS lat
       FROM embalses WHERE id = $1`,
      [id]
    );

    if (emb.rows.length === 0) {
      return res.status(404).json({ message: 'Embalse no encontrado' });
    }

    const { nombre, lat, lon } = emb.rows[0];
    const windyUrl = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=12&level=surface&overlay=rain&marker=true&detailLat=${lat}&detailLon=${lon}&key=W9mTyDecCnMdGxCiFKb2BHLwd1fKT2Nq`;

    res.status(200).json({ nombre, lat, lon, windyUrl });
  } catch (error) {
    console.error('Error al generar el mapa:', error);
    res.status(500).json({ message: 'Error al generar el mapa', error });
  }
});

// Se listan las últimas 50 alertas
app.get('/alertas', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        embalse_id   AS "embalseId",
        nombre,
        capacidad,
        volumen_porcentual AS "volumenPorcentual",
        mensaje,
        created_at         AS timestamp
      FROM alertas
      ORDER BY created_at DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener alertas:', err);
    res.status(500).json({ message: 'Error al obtener alertas' });
  }
});


