const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
