const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definimos el modelo de HistorialResumenEmbalses
const HistorialResumenEmbalses = sequelize.define('historialresumenembalses', {
    CapacidadTotal: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    PorcentajeTotal: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false  
  });

module.exports = HistorialResumenEmbalses;
