
// src/AlertasEmbalses.js
require("dotenv").config();
const axios       = require("axios");
const sequelize   = require('../config/database');
const { Pool }    = require("pg");
const TelegramBot = require("node-telegram-bot-api");

/*const pool = new Pool({
  user:     'postgres',
  host:     'localhost',
  database: 'postgres',
  password: 'admin',
  port:     5432,
});*/

const pool = new Pool({
  user:     process.env.DB_USER,    // ej. 'doadmin'
  host:     process.env.DB_HOST,    // ej. 'db-postgresql-nyc3-12345-do-user-678901-0.db.ondigitalocean.com'
  database: process.env.DB_NAME,    // ej. 'defaultdb'
  password: process.env.DB_PASSWORD,    // la contraseña que creaste en DigitalOcean
  port:     parseInt(process.env.DB_PORT, 10),  // ej. 25060
  ssl: {
    rejectUnauthorized: false        // Obliga a usar TLS/SSL y acepta el certificado autofirmado de DigitalOcean
  }
});

const NIVEL_CRITICO_EMBALSE  = 30;
const NIVEL_CRITICO_EMBALSES = 50;
const botToken               = process.env.TELEGRAM_BOT_TOKEN;
const chatId                 = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(botToken, { polling: true });

// Función para enviar alerta de un embalse individual
const enviarAlertaTelegramEmbalse = async (embalse) => {
  const mensaje = `⚠️⚠️ *Alerta capacidad de Embalses* ⚠️⚠️\n\n` +
                  `🚨🚨URGENTE🚨🚨\n\n` +
                  `El embalse *${embalse.nombre}* ha alcanzado un nivel critico: ${embalse.volumen_porcentual}%`;

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
                  `Los embalses han alcanzado un nivel critico: ${porcentajeTotal}%`;

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

// Comandos de Telegram para estado individual
bot.onText(/\/embalses/, async (msg) => {
  try {
    const result   = await pool.query(
      "SELECT nombre, volumen_porcentual, capacidad FROM embalses"
    );
    const embalses = result.rows;

    if (embalses.length === 0) {
      return bot.sendMessage(msg.chat.id, "⚠️ No hay datos de embalses disponibles.");
    }

    let mensaje = "📊 *Estado de los embalses:*\n\n";
    embalses.forEach(e => {
      mensaje += `🌊 *${e.nombre}*: ${e.volumen_porcentual}% (Capacidad: ${e.capacidad} hm³)\n`;
    });

    bot.sendMessage(msg.chat.id, mensaje, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("❌ Error obteniendo datos de embalses:", error);
    bot.sendMessage(msg.chat.id, "⚠️ Error al obtener datos de los embalses.");
  }
});

// Comando de Telegram para resumen global
bot.onText(/\/resumenembalses/, async (msg) => {
  try {
    const result = await pool.query(
      'SELECT "PorcentajeTotal", "CapacidadTotal" FROM resumenembalses'
    );
    const row = result.rows[0];
    if (!row) {
      return bot.sendMessage(msg.chat.id, "⚠️ No hay datos disponibles de embalses.");
    }

    let mensaje = "📊 *Resumen de los embalses:*\n\n" +
                  `🔢 *Nivel total*: ${row.PorcentajeTotal.toFixed(2)}%\n` +
                  `🗳️ *Capacidad total*: ${row.CapacidadTotal.toFixed(2)} hm³\n\n`;

    bot.sendMessage(msg.chat.id, mensaje, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("❌ Error al obtener el resumen de los embalses:", error);
    bot.sendMessage(msg.chat.id, "⚠️ Error al obtener el resumen de los embalses.");
  }
});

// Iniciar verificaciones cada 10 minutos
setInterval(() => {
  verificarEmbalse();
  verificarEmbalses();
}, 10 * 60 * 1000);

// Primera verificación al arrancar
verificarEmbalse();
verificarEmbalses();
