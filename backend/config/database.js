/*const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

  const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = sequelize;*/

const { Sequelize } = require('sequelize');
require('dotenv').config();

const isUsingSSL = process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Solo si el host NO es local, agregamos el bloque de SSL:
  dialectOptions: isUsingSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},
  logging: false
});

module.exports = sequelize;
