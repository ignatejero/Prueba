const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definir el modelo de Embalse
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
  tableName: 'embalses',  // Asegúrate de que coincide con tu base de datos
  timestamps: false  
});

module.exports = Embalse;