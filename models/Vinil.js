const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vinil = sequelize.define('Vinil', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    artista: {
        type: DataTypes.STRING,
        allowNull: false
    },
    artistaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Artistas',
            key: 'id'
        }
    },
    musicaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Musicas',
            key: 'id'
        }
    },
    preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    ano: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    genero: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const value = this.getDataValue('genero');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('genero', JSON.stringify(value));
        }
    },
    quant: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    }
}, {
    tableName: 'vinis',
    timestamps: false
});

module.exports = Vinil;

