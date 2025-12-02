const sequelize = require('../config/database');
const Vinil = require('./Vinil');
const Perfil = require('./Perfil');
const Genero = require('./Genero');
const Artista = require('./Artista');
const Musica = require('./Musica');
const Compra = require('./Compra');

// Definir relacionamentos
Vinil.belongsTo(Artista, { foreignKey: 'artistaId', as: 'artistaRel' });
Vinil.belongsTo(Musica, { foreignKey: 'musicaId', as: 'musicaRel' });
Musica.belongsTo(Artista, { foreignKey: 'artistaId', as: 'artistaRel' });
Compra.belongsTo(Perfil, { foreignKey: 'clienteId', as: 'cliente' });
Compra.belongsTo(Vinil, { foreignKey: 'vinilId', as: 'vinil' });

// Sincronizar banco de dados
async function syncDatabase() {
    try {
        await sequelize.sync({ force: false });
        console.log('Banco de dados sincronizado com sucesso!');
    } catch (error) {
        console.error('Erro ao sincronizar banco de dados:', error);
    }
}

module.exports = {
    sequelize,
    Vinil,
    Perfil,
    Genero,
    Artista,
    Musica,
    Compra,
    syncDatabase
};

