const express = require("express");
const router = express.Router();
const { Vinil, Genero, Artista, Musica } = require("../models");

// Listar vinis
router.get('/', async (req, res) => {
    try {
        const vinis = await Vinil.findAll({
            order: [['id', 'ASC']],
            raw: false
        });
        // Garantir que o getter seja chamado acessando a propriedade antes de toJSON
        const vinisData = vinis.map(v => {
            // Acessar genero para forçar o getter
            const genero = v.genero;
            const data = v.toJSON();
            // Garantir que genero seja um array
            data.genero = Array.isArray(genero) ? genero : (genero ? [genero] : []);
            return data;
        });
        res.render('listaVinis', { vinis: vinisData });
    } catch (error) {
        res.status(500).send('Erro ao buscar vinis: ' + error.message);
    }
});

// Form adicionar
router.get('/add', async (req, res) => {
    try {
        const generos = await Genero.findAll({ order: [['nome', 'ASC']] });
        const artistas = await Artista.findAll({ order: [['nome', 'ASC']] });
        const musicas = await Musica.findAll({ order: [['nome', 'ASC']] });
        res.render('addVinis', { 
            generos: generos.map(g => g.toJSON()),
            artistas: artistas.map(a => a.toJSON()),
            musicas: musicas.map(m => m.toJSON())
        });
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Criar
router.post('/', async (req, res) => {
    try {
        const { nome, artista, artistaId, musicaId, preco, ano, genero, quant, foto } = req.body;
        const generosArray = genero ? (Array.isArray(genero) ? genero : [genero]) : [];
        
        let nomeArtista = artista;
        if (artistaId) {
            const artistaObj = await Artista.findByPk(artistaId);
            if (artistaObj) nomeArtista = artistaObj.nome;
        }
        
        await Vinil.create({
            nome,
            artista: nomeArtista,
            artistaId: artistaId ? parseInt(artistaId) : null,
            musicaId: musicaId ? parseInt(musicaId) : null,
            preco: parseFloat(preco) || 0,
            ano: parseInt(ano) || new Date().getFullYear(),
            genero: generosArray,
            quant: parseInt(quant) || 0,
            foto: foto || ''
        });
        res.redirect('/vinis');
    } catch (error) {
        res.status(500).send('Erro ao criar vinil: ' + error.message);
    }
});

// Detalhar
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const vinil = await Vinil.findByPk(id);
        if (vinil) {
            const genero = vinil.genero;
            const data = vinil.toJSON();
            data.genero = Array.isArray(genero) ? genero : (genero ? [genero] : []);
            res.render('detalharVinil', { vinil: data });
        } else {
            res.status(404).send('Vinil não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao buscar vinil: ' + error.message);
    }
});

// Editar form
router.get('/:id/edit', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const vinil = await Vinil.findByPk(id);
        if (vinil) {
            const generos = await Genero.findAll({ order: [['nome', 'ASC']] });
            const artistas = await Artista.findAll({ order: [['nome', 'ASC']] });
            const musicas = await Musica.findAll({ order: [['nome', 'ASC']] });
            const genero = vinil.genero;
            const vinilData = vinil.toJSON();
            vinilData.genero = Array.isArray(genero) ? genero : (genero ? [genero] : []);
            res.render('editarVinil', { 
                vinil: vinilData,
                generos: generos.map(g => g.toJSON()),
                artistas: artistas.map(a => a.toJSON()),
                musicas: musicas.map(m => m.toJSON())
            });
        } else {
            res.status(404).send('Vinil não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Atualizar
router.post('/:id/update', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, artista, artistaId, musicaId, preco, ano, genero, quant, foto } = req.body;
        const vinil = await Vinil.findByPk(id);
        
        if (!vinil) {
            return res.status(404).send('Vinil não encontrado');
        }
        
        const generosArray = genero ? (Array.isArray(genero) ? genero : [genero]) : [];
        
        let nomeArtista = artista || vinil.artista;
        if (artistaId) {
            const artistaObj = await Artista.findByPk(artistaId);
            if (artistaObj) nomeArtista = artistaObj.nome;
        }
        
        await vinil.update({
            nome,
            artista: nomeArtista,
            artistaId: artistaId ? parseInt(artistaId) : vinil.artistaId,
            musicaId: musicaId ? parseInt(musicaId) : vinil.musicaId,
            preco: parseFloat(preco) || 0,
            ano: parseInt(ano) || new Date().getFullYear(),
            genero: generosArray,
            quant: parseInt(quant) || 0,
            foto: foto || vinil.foto || ''
        });
        res.redirect('/vinis');
    } catch (error) {
        res.status(500).send('Erro ao atualizar vinil: ' + error.message);
    }
});

// Deletar
router.post('/:id/delete', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const vinil = await Vinil.findByPk(id);
        if (vinil) {
            await vinil.destroy();
            res.redirect('/vinis');
        } else {
            res.status(404).send('Vinil não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao deletar vinil: ' + error.message);
    }
});

module.exports = router;
