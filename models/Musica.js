const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Musica = sequelize.define('Musica', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duracao: {
        type: DataTypes.STRING,
        allowNull: true
    },
    artistaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Artistas',
            key: 'id'
        }
    }
}, {
    tableName: 'musicas',
    timestamps: false
});

module.exports = Musica;

