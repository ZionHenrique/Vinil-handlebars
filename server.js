const express = require('express');
const exphbs = require('express-handlebars');
const { Vinil, Perfil, Genero, Artista, Musica, Compra, syncDatabase } = require('./models');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helpers do Handlebars
const hbs = exphbs.create({
    defaultLayout: false,
    helpers: {
        eq: function(a, b) {
            return a === b;
        },
        contains: function(array, value) {
            if (!array || !Array.isArray(array)) return false;
            return array.includes(value);
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Sincronizar banco de dados ao iniciar
syncDatabase();

// Rota principal
app.get('/', (req, res) => res.render('home'));

// ========== CRUD DE VINIS ==========
// Listar todos os vinis
app.get('/vinis', async (req, res) => {
    try {
        const vinis = await Vinil.findAll({
            order: [['id', 'ASC']]
        });
        res.render('listaVinis', { vinis: vinis.map(v => v.toJSON()) });
    } catch (error) {
        res.status(500).send('Erro ao buscar vinis: ' + error.message);
    }
});

// Formulário para adicionar vinil
app.get('/vinis/add', async (req, res) => {
    try {
        const generos = await Genero.findAll();
        const artistas = await Artista.findAll();
        const musicas = await Musica.findAll();
        res.render('addVinis', { 
            generos: generos.map(g => g.toJSON()),
            artistas: artistas.map(a => a.toJSON()),
            musicas: musicas.map(m => m.toJSON())
        });
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Criar novo vinil
app.post('/vinis', async (req, res) => {
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

// Detalhar vinil 
app.get('/vinis/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const vinil = await Vinil.findByPk(id);
        if (vinil) {
            res.render('detalharVinil', { vinil: vinil.toJSON() });
        } else {
            res.status(404).send('Vinil não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao buscar vinil: ' + error.message);
    }
});

// Formulário para editar vinil
app.get('/vinis/:id/edit', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const vinil = await Vinil.findByPk(id);
        if (vinil) {
            const generos = await Genero.findAll();
            const artistas = await Artista.findAll();
            const musicas = await Musica.findAll();
            res.render('editarVinil', { 
                vinil: vinil.toJSON(),
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

// Atualizar vinil
app.post('/vinis/:id/update', async (req, res) => {
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

// Deletar vinil
app.post('/vinis/:id/delete', async (req, res) => {
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

// ========== CRUD DE PERFIS ==========
// Listar todos os perfis
app.get('/perfis', async (req, res) => {
    try {
        const perfis = await Perfil.findAll({ order: [['id', 'ASC']] });
        res.render('listaPerfis', { perfis: perfis.map(p => p.toJSON()) });
    } catch (error) {
        res.status(500).send('Erro ao buscar perfis: ' + error.message);
    }
});

// Formulário para adicionar perfil
app.get('/perfis/add', (req, res) => {
    res.render('addPerfil');
});

// Criar novo perfil
app.post('/perfis', async (req, res) => {
    try {
        const { nome, email, telefone, endereco } = req.body;
        await Perfil.create({ nome, email, telefone, endereco });
        res.redirect('/perfis');
    } catch (error) {
        res.status(500).send('Erro ao criar perfil: ' + error.message);
    }
});

// Detalhar perfil específico
app.get('/perfis/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const perfil = await Perfil.findByPk(id);
        if (perfil) {
            res.render('detalharPerfil', { perfil: perfil.toJSON() });
        } else {
            res.status(404).send('Perfil não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao buscar perfil: ' + error.message);
    }
});

// Formulário para editar perfil
app.get('/perfis/:id/edit', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const perfil = await Perfil.findByPk(id);
        if (perfil) {
            res.render('editarPerfil', { perfil: perfil.toJSON() });
        } else {
            res.status(404).send('Perfil não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Atualizar perfil
app.post('/perfis/:id/update', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, email, telefone, endereco } = req.body;
        const perfil = await Perfil.findByPk(id);
        if (perfil) {
            await perfil.update({ nome, email, telefone, endereco });
            res.redirect('/perfis');
        } else {
            res.status(404).send('Perfil não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao atualizar perfil: ' + error.message);
    }
});

// Deletar perfil
app.post('/perfis/:id/delete', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const perfil = await Perfil.findByPk(id);
        if (perfil) {
            await perfil.destroy();
            res.redirect('/perfis');
        } else {
            res.status(404).send('Perfil não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao deletar perfil: ' + error.message);
    }
});

// ========== CRUD DE GÊNEROS ==========
// Listar todos os gêneros
app.get('/generos', async (req, res) => {
    try {
        const generos = await Genero.findAll({ order: [['id', 'ASC']] });
        res.render('listaGeneros', { generos: generos.map(g => g.toJSON()) });
    } catch (error) {
        res.status(500).send('Erro ao buscar gêneros: ' + error.message);
    }
});

// Formulário para adicionar gênero
app.get('/generos/add', (req, res) => {
    res.render('addGenero');
});

// Criar novo gênero
app.post('/generos', async (req, res) => {
    try {
        const { nome, descricao } = req.body;
        await Genero.create({ nome, descricao });
        res.redirect('/generos');
    } catch (error) {
        res.status(500).send('Erro ao criar gênero: ' + error.message);
    }
});

// Detalhar gênero específico
app.get('/generos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const genero = await Genero.findByPk(id);
        if (genero) {
            res.render('detalharGenero', { genero: genero.toJSON() });
        } else {
            res.status(404).send('Gênero não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao buscar gênero: ' + error.message);
    }
});

// Formulário para editar gênero
app.get('/generos/:id/edit', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const genero = await Genero.findByPk(id);
        if (genero) {
            res.render('editarGenero', { genero: genero.toJSON() });
        } else {
            res.status(404).send('Gênero não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Atualizar gênero
app.post('/generos/:id/update', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, descricao } = req.body;
        const genero = await Genero.findByPk(id);
        if (genero) {
            await genero.update({ nome, descricao });
            res.redirect('/generos');
        } else {
            res.status(404).send('Gênero não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao atualizar gênero: ' + error.message);
    }
});

// Deletar gênero
app.post('/generos/:id/delete', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const genero = await Genero.findByPk(id);
        if (genero) {
            await genero.destroy();
            res.redirect('/generos');
        } else {
            res.status(404).send('Gênero não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao deletar gênero: ' + error.message);
    }
});

// ========== CRUD DE ARTISTAS ==========
// Listar todos os artistas
app.get('/artistas', async (req, res) => {
    try {
        const artistas = await Artista.findAll({ order: [['id', 'ASC']] });
        res.render('artistas/listaArtistas', { artistas: artistas.map(a => a.toJSON()) });
    } catch (error) {
        res.status(500).send('Erro ao buscar artistas: ' + error.message);
    }
});

// Formulário para adicionar artista
app.get('/artistas/add', (req, res) => {
    res.render('artistas/addArtista');
});

// Criar novo artista
app.post('/artistas', async (req, res) => {
    try {
        const { nome, biografia } = req.body;
        await Artista.create({ nome, biografia: biografia || '' });
        res.redirect('/artistas');
    } catch (error) {
        res.status(500).send('Erro ao criar artista: ' + error.message);
    }
});

// Detalhar artista específico
app.get('/artistas/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const artista = await Artista.findByPk(id);
        if (artista) {
            res.render('artistas/detalharArtista', { artista: artista.toJSON() });
        } else {
            res.status(404).send('Artista não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao buscar artista: ' + error.message);
    }
});

// Formulário para editar artista
app.get('/artistas/:id/edit', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const artista = await Artista.findByPk(id);
        if (artista) {
            res.render('artistas/editarArtista', { artista: artista.toJSON() });
        } else {
            res.status(404).send('Artista não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Atualizar artista
app.post('/artistas/:id/update', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, biografia } = req.body;
        const artista = await Artista.findByPk(id);
        if (artista) {
            await artista.update({ nome, biografia: biografia || '' });
            res.redirect('/artistas');
        } else {
            res.status(404).send('Artista não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao atualizar artista: ' + error.message);
    }
});

// Deletar artista
app.post('/artistas/:id/delete', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const artista = await Artista.findByPk(id);
        if (artista) {
            await artista.destroy();
            res.redirect('/artistas');
        } else {
            res.status(404).send('Artista não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao deletar artista: ' + error.message);
    }
});

// ========== CRUD DE MÚSICAS ==========
// Listar todas as músicas
app.get('/musicas', async (req, res) => {
    try {
        const musicas = await Musica.findAll({ 
            include: [{ model: Artista, as: 'artistaRel' }],
            order: [['id', 'ASC']] 
        });
        res.render('musicas/listaMusicas', { 
            musicas: musicas.map(m => ({
                ...m.toJSON(),
                artistaNome: m.artistaRel ? m.artistaRel.nome : 'Sem artista'
            }))
        });
    } catch (error) {
        res.status(500).send('Erro ao buscar músicas: ' + error.message);
    }
});

// Formulário para adicionar música
app.get('/musicas/add', async (req, res) => {
    try {
        const artistas = await Artista.findAll();
        res.render('musicas/addMusica', { artistas: artistas.map(a => a.toJSON()) });
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Criar nova música
app.post('/musicas', async (req, res) => {
    try {
        const { nome, duracao, artistaId } = req.body;
        await Musica.create({ 
            nome, 
            duracao: duracao || '', 
            artistaId: artistaId ? parseInt(artistaId) : null 
        });
        res.redirect('/musicas');
    } catch (error) {
        res.status(500).send('Erro ao criar música: ' + error.message);
    }
});

// Detalhar música específica
app.get('/musicas/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const musica = await Musica.findByPk(id, {
            include: [{ model: Artista, as: 'artistaRel' }]
        });
        if (musica) {
            res.render('musicas/detalharMusica', { 
                musica: {
                    ...musica.toJSON(),
                    artistaNome: musica.artistaRel ? musica.artistaRel.nome : 'Sem artista'
                }
            });
        } else {
            res.status(404).send('Música não encontrada');
        }
    } catch (error) {
        res.status(500).send('Erro ao buscar música: ' + error.message);
    }
});

// Formulário para editar música
app.get('/musicas/:id/edit', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const musica = await Musica.findByPk(id);
        const artistas = await Artista.findAll();
        if (musica) {
            res.render('musicas/editarMusica', { 
                musica: musica.toJSON(),
                artistas: artistas.map(a => a.toJSON())
            });
        } else {
            res.status(404).send('Música não encontrada');
        }
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Atualizar música
app.post('/musicas/:id/update', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, duracao, artistaId } = req.body;
        const musica = await Musica.findByPk(id);
        if (musica) {
            await musica.update({ 
                nome, 
                duracao: duracao || '', 
                artistaId: artistaId ? parseInt(artistaId) : null 
            });
            res.redirect('/musicas');
        } else {
            res.status(404).send('Música não encontrada');
        }
    } catch (error) {
        res.status(500).send('Erro ao atualizar música: ' + error.message);
    }
});

// Deletar música
app.post('/musicas/:id/delete', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const musica = await Musica.findByPk(id);
        if (musica) {
            await musica.destroy();
            res.redirect('/musicas');
        } else {
            res.status(404).send('Música não encontrada');
        }
    } catch (error) {
        res.status(500).send('Erro ao deletar música: ' + error.message);
    }
});

// ========== CRUD DE COMPRAS ==========
// Listar todas as compras
app.get('/compras', async (req, res) => {
    try {
        const compras = await Compra.findAll({
            include: [
                { model: Perfil, as: 'cliente' },
                { model: Vinil, as: 'vinil' }
            ],
            order: [['id', 'ASC']]
        });
        res.render('listaCompras', {
            compras: compras.map(c => ({
                ...c.toJSON(),
                clienteNome: c.cliente ? c.cliente.nome : 'Cliente não encontrado',
                vinilNome: c.vinil ? c.vinil.nome : 'Vinil não encontrado',
                vinilArtista: c.vinil ? c.vinil.artista : ''
            }))
        });
    } catch (error) {
        res.status(500).send('Erro ao buscar compras: ' + error.message);
    }
});

// Formulário para adicionar compra
app.get('/compras/add', async (req, res) => {
    try {
        const perfis = await Perfil.findAll();
        const vinis = await Vinil.findAll();
        res.render('addCompra', {
            perfis: perfis.map(p => p.toJSON()),
            vinis: vinis.map(v => v.toJSON())
        });
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Criar nova compra
app.post('/compras', async (req, res) => {
    try {
        const { clienteId, vinilId, quantidade } = req.body;
        const cliente = await Perfil.findByPk(parseInt(clienteId));
        const vinil = await Vinil.findByPk(parseInt(vinilId));
        
        if (!cliente || !vinil) {
            return res.status(400).send('Cliente ou vinil não encontrado');
        }
        
        const qtd = parseInt(quantidade) || 1;
        if (qtd > vinil.quant) {
            return res.status(400).send('Quantidade solicitada maior que o estoque disponível');
        }
        
        const total = vinil.preco * qtd;
        await Compra.create({
            clienteId: parseInt(clienteId),
            vinilId: parseInt(vinilId),
            quantidade: qtd,
            data: new Date().toISOString().split('T')[0],
            total: total
        });
        
        // Atualizar estoque
        await vinil.update({ quant: vinil.quant - qtd });
        
        res.redirect('/compras');
    } catch (error) {
        res.status(500).send('Erro ao criar compra: ' + error.message);
    }
});

// Detalhar compra específica
app.get('/compras/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const compra = await Compra.findByPk(id, {
            include: [
                { model: Perfil, as: 'cliente' },
                { model: Vinil, as: 'vinil' }
            ]
        });
        if (compra) {
            res.render('detalharCompra', {
                compra: {
                    ...compra.toJSON(),
                    cliente: compra.cliente || { nome: 'Cliente não encontrado' },
                    vinil: compra.vinil || { nome: 'Vinil não encontrado' }
                }
            });
        } else {
            res.status(404).send('Compra não encontrada');
        }
    } catch (error) {
        res.status(500).send('Erro ao buscar compra: ' + error.message);
    }
});

// Formulário para editar compra
app.get('/compras/:id/edit', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const compra = await Compra.findByPk(id);
        const perfis = await Perfil.findAll();
        const vinis = await Vinil.findAll();
        if (compra) {
            res.render('editarCompra', {
                compra: compra.toJSON(),
                perfis: perfis.map(p => p.toJSON()),
                vinis: vinis.map(v => v.toJSON())
            });
        } else {
            res.status(404).send('Compra não encontrada');
        }
    } catch (error) {
        res.status(500).send('Erro ao carregar formulário: ' + error.message);
    }
});

// Atualizar compra
app.post('/compras/:id/update', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { clienteId, vinilId, quantidade, data } = req.body;
        const compra = await Compra.findByPk(id);
        
        if (!compra) {
            return res.status(404).send('Compra não encontrada');
        }
        
        const compraAntiga = compra.toJSON();
        const vinilAntigo = await Vinil.findByPk(compraAntiga.vinilId);
        const vinilNovo = await Vinil.findByPk(parseInt(vinilId));
        
        // Restaurar estoque do vinil antigo
        if (vinilAntigo) {
            await vinilAntigo.update({ quant: vinilAntigo.quant + compraAntiga.quantidade });
        }
        
        // Verificar estoque do novo vinil
        const qtd = parseInt(quantidade) || 1;
        if (qtd > vinilNovo.quant) {
            // Restaurar estoque
            if (vinilAntigo) {
                await vinilAntigo.update({ quant: vinilAntigo.quant - compraAntiga.quantidade });
            }
            return res.status(400).send('Quantidade solicitada maior que o estoque disponível');
        }
        
        // Atualizar estoque do novo vinil
        await vinilNovo.update({ quant: vinilNovo.quant - qtd });
        
        const total = vinilNovo.preco * qtd;
        await compra.update({
            clienteId: parseInt(clienteId),
            vinilId: parseInt(vinilId),
            quantidade: qtd,
            data: data || compraAntiga.data,
            total: total
        });
        res.redirect('/compras');
    } catch (error) {
        res.status(500).send('Erro ao atualizar compra: ' + error.message);
    }
});

// Deletar compra
app.post('/compras/:id/delete', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const compra = await Compra.findByPk(id);
        if (compra) {
            const vinil = await Vinil.findByPk(compra.vinilId);
            
            // Restaurar estoque
            if (vinil) {
                await vinil.update({ quant: vinil.quant + compra.quantidade });
            }
            
            await compra.destroy();
            res.redirect('/compras');
        } else {
            res.status(404).send('Compra não encontrada');
        }
    } catch (error) {
        res.status(500).send('Erro ao deletar compra: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor em execução: http://localhost:${port}`);
});
