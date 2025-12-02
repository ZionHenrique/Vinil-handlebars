const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Artista = sequelize.define('Artista', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pais: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ano_inicio: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    biografia: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'artistas',
    timestamps: false
});

module.exports = Artista;

