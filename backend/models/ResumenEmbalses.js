const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definimos el modelo de ResumenEmbalses
const ResumenEmbalses = sequelize.define('resumenembalses', {
  PorcentajeTotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  CapacidadTotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  timestamps: false  
});

module.exports = ResumenEmbalses;
