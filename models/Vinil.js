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
            const rawValue = this.getDataValue('genero');
            if (!rawValue || rawValue === '') return [];
            
            // Se já for um array (já processado), retornar
            if (Array.isArray(rawValue)) return rawValue;
            
            const value = String(rawValue);
            
            // Tentar fazer parse de JSON apenas se começar com [ ou {
            if (value.trim().startsWith('[') || value.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(value);
                    return Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    // Se falhar o parse, tratar como string simples
                }
            }
            
            // Se não for JSON, tratar como string separada por vírgula ou string simples
            if (value.includes(',')) {
                return value.split(',').map(g => g.trim()).filter(g => g);
            }
            return [value.trim()].filter(g => g);
        },
        set(value) {
            if (Array.isArray(value)) {
                this.setDataValue('genero', JSON.stringify(value));
            } else if (typeof value === 'string') {
                // Se já for uma string, manter como está (compatibilidade com dados antigos)
                this.setDataValue('genero', value);
            } else {
                this.setDataValue('genero', JSON.stringify([value]));
            }
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

