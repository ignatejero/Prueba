const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definimos el modelo de HistorialEmbalses
const HistorialEmbalses = sequelize.define('historialembalses', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacidad: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    volumen_porcentual: {
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

module.exports = HistorialEmbalses;
