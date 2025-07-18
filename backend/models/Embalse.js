const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definimos el modelo de Embalse
const Embalse = sequelize.define('embalses', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacidad: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  ubicacion_geo: {
    type: DataTypes.GEOGRAPHY,
    allowNull: false
  },
  volumen_porcentual: {
    type: DataTypes.FLOAT,
    allowNull: false 
  }
}, {
  tableName: 'embalses',  // ponemos la tabla embalses de la base de datos
  timestamps: false  
});

module.exports = Embalse;