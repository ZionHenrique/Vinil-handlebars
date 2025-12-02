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
    biografia: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'artistas',
    timestamps: false
});

module.exports = Artista;

