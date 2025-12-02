const express = require('express');
const exphbs = require('express-handlebars');

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

// Dados em memória
let vinis = [
    {id: 1, nome: 'Chromakopia', artista: 'Tyler, the Creator', preco: 800.99, ano: 2024, genero: ["rap"], quant: 500},
    {id: 2, nome: "Breach", artista:" Twenty one pilots", preco:666.66, ano: 2025, genero: ["descubra", "rock alt", 'pop rock'], quant: 690},
    {id: 3, nome: "To Pimp a butterfly", artista: "Kendrick Lamar", preco: 1.69, ano: 2015, genero: ["rap"], quant: 20}
]

let perfis = [
    {id: 1, nome: 'João Guilherme', email: 'franga@email.com', telefone: '(24) 24242-4242', endereco: 'Rua Soltou, 123'},
    {id: 2, nome: 'Virginia Fonseca', email: 'wepink@email.com', telefone: '(66) 66666-6666', endereco: 'Rua Flofo Biuta, 456'},
    {id: 3, nome: 'Renan Bolsonaro', email: 'renanblsaro@gmail.com', telefone: '(22) 22222-2222', endereco: 'Rua Bolsoraro, 22'}
]

let generos = [
    {id: 1, nome: 'Rap', descricao: 'Hip-hop e rap'},
    {id: 2, nome: 'Rock', descricao: 'Rock alternativo e pop rock'},
    {id: 3, nome: 'Pop', descricao: 'Música popular'}
]

let compras = [
    {id: 1, clienteId: 1, vinilId: 1, quantidade: 2, data: '2024-01-15', total: 1601.98},
    {id: 2, clienteId: 2, vinilId: 2, quantidade: 1, data: '2024-01-20', total: 666.66}
]

let nextViniId = 4;
let nextPerfilId = 4;
let nextGeneroId = 4;
let nextCompraId = 3;

// Rota principal
app.get('/', (req, res) => res.render('home'));

// ========== CRUD DE VINIS ==========
// Listar todos os vinis
app.get('/vinis', (req, res) => {
    res.render('listaVinis', {vinis})
})

// Formulário para adicionar vinil
app.get('/vinis/add', (req, res) => {
    res.render('addVinis', {generos})
})

// Criar novo vinil
app.post('/vinis', (req, res) => {
    const {nome, artista, preco, ano, genero, quant} = req.body;
    const generosArray = genero ? (Array.isArray(genero) ? genero : [genero]) : [];
    const novoVinil = {
        id: nextViniId++,
        nome,
        artista,
        preco: parseFloat(preco) || 0,
        ano: parseInt(ano) || new Date().getFullYear(),
        genero: generosArray,
        quant: parseInt(quant) || 0
    };
    vinis.push(novoVinil);
    res.redirect('/vinis');
})

// Detalhar vinil 
app.get('/vinis/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const vinil = vinis.find(v => v.id === id);
    if (vinil) {
        res.render('detalharVinil', {vinil});
    } else {
        res.status(404).send('Vinil não encontrado');
    }
})

// Formulário para editar vinil
app.get('/vinis/:id/edit', (req, res) => {
    const id = parseInt(req.params.id);
    const vinil = vinis.find(v => v.id === id);
    if (vinil) {
        res.render('editarVinil', {vinil, generos});
    } else {
        res.status(404).send('Vinil não encontrado');
    }
})

// Atualizar vinil
app.post('/vinis/:id/update', (req, res) => {
    const id = parseInt(req.params.id);
    const {nome, artista, preco, ano, genero, quant} = req.body;
    const index = vinis.findIndex(v => v.id === id);
    if (index !== -1) {
        const generosArray = genero ? (Array.isArray(genero) ? genero : [genero]) : [];
        vinis[index] = {
            id,
            nome,
            artista,
            preco: parseFloat(preco) || 0,
            ano: parseInt(ano) || new Date().getFullYear(),
            genero: generosArray,
            quant: parseInt(quant) || 0
        };
        res.redirect('/vinis');
    } else {
        res.status(404).send('Vinil não encontrado');
    }
})

// Deletar vinil
app.post('/vinis/:id/delete', (req, res) => {
    const id = parseInt(req.params.id);
    const index = vinis.findIndex(v => v.id === id);
    if (index !== -1) {
        vinis.splice(index, 1);
        res.redirect('/vinis');
    } else {
        res.status(404).send('Vinil não encontrado');
    }
})

// ========== CRUD DE PERFIS ==========
// Listar todos os perfis
app.get('/perfis', (req, res) => {
    res.render('listaPerfis', {perfis})
})

// Formulário para adicionar perfil
app.get('/perfis/add', (req, res) => {
    res.render('addPerfil')
})

// Criar novo perfil
app.post('/perfis', (req, res) => {
    const {nome, email, telefone, endereco} = req.body;
    const novoPerfil = {
        id: nextPerfilId++,
        nome,
        email,
        telefone,
        endereco
    };
    perfis.push(novoPerfil);
    res.redirect('/perfis');
})

// Detalhar perfil específico
app.get('/perfis/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const perfil = perfis.find(p => p.id === id);
    if (perfil) {
        res.render('detalharPerfil', {perfil});
    } else {
        res.status(404).send('Perfil não encontrado');
    }
})

// Formulário para editar perfil
app.get('/perfis/:id/edit', (req, res) => {
    const id = parseInt(req.params.id);
    const perfil = perfis.find(p => p.id === id);
    if (perfil) {
        res.render('editarPerfil', {perfil});
    } else {
        res.status(404).send('Perfil não encontrado');
    }
})

// Atualizar perfil
app.post('/perfis/:id/update', (req, res) => {
    const id = parseInt(req.params.id);
    const {nome, email, telefone, endereco} = req.body;
    const index = perfis.findIndex(p => p.id === id);
    if (index !== -1) {
        perfis[index] = {id, nome, email, telefone, endereco};
        res.redirect('/perfis');
    } else {
        res.status(404).send('Perfil não encontrado');
    }
})

// Deletar perfil
app.post('/perfis/:id/delete', (req, res) => {
    const id = parseInt(req.params.id);
    const index = perfis.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).send('Perfil não encontrado');
    perfis.splice(index, 1);
    res.redirect('/perfis');
})

// ========== CRUD DE GÊNEROS ==========
// Listar todos os gêneros
app.get('/generos', (req, res) => {
    res.render('listaGeneros', {generos})
})

// Formulário para adicionar gênero
app.get('/generos/add', (req, res) => {
    res.render('addGenero')
})

// Criar novo gênero
app.post('/generos', (req, res) => {
    const {nome, descricao} = req.body;
    const novoGenero = {
        id: nextGeneroId++,
        nome,
        descricao
    };
    generos.push(novoGenero);
    res.redirect('/generos');
})

// Detalhar gênero específico
app.get('/generos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const genero = generos.find(g => g.id === id);
    if (genero) {
        res.render('detalharGenero', {genero});
    } else {
        res.status(404).send('Gênero não encontrado');
    }
})

// Formulário para editar gênero
app.get('/generos/:id/edit', (req, res) => {
    const id = parseInt(req.params.id);
    const genero = generos.find(g => g.id === id);
    if (genero) {
        res.render('editarGenero', {genero});
    } else {
        res.status(404).send('Gênero não encontrado');
    }
})

// Atualizar gênero
app.post('/generos/:id/update', (req, res) => {
    const id = parseInt(req.params.id);
    const {nome, descricao} = req.body;
    const index = generos.findIndex(g => g.id === id);
    if (index !== -1) {
        generos[index] = {id, nome, descricao};
        res.redirect('/generos');
    } else {
        res.status(404).send('Gênero não encontrado');
    }
})

// Deletar gênero
app.post('/generos/:id/delete', (req, res) => {
    const id = parseInt(req.params.id);
    const index = generos.findIndex(g => g.id === id);
    if (index !== -1) {
        generos.splice(index, 1);
        res.redirect('/generos');
    } else {
        res.status(404).send('Gênero não encontrado');
    }
})

// ========== CRUD DE COMPRAS ==========
// Listar todas as compras
app.get('/compras', (req, res) => {
    const comprasComDetalhes = compras.map(compra => {
        const cliente = perfis.find(p => p.id === compra.clienteId);
        const vinil = vinis.find(v => v.id === compra.vinilId);
        return {
            ...compra,
            clienteNome: cliente ? cliente.nome : 'Cliente não encontrado',
            vinilNome: vinil ? vinil.nome : 'Vinil não encontrado',
            vinilArtista: vinil ? vinil.artista : ''
        };
    });
    res.render('listaCompras', {compras: comprasComDetalhes, perfis, vinis});
})

// Formulário para adicionar compra
app.get('/compras/add', (req, res) => {
    res.render('addCompra', {perfis, vinis})
})

// Criar nova compra
app.post('/compras', (req, res) => {
    const {clienteId, vinilId, quantidade} = req.body;
    const cliente = perfis.find(p => p.id === parseInt(clienteId));
    const vinil = vinis.find(v => v.id === parseInt(vinilId));
    
    if (!cliente || !vinil) {
        return res.status(400).send('Cliente ou vinil não encontrado');
    }
    
    const qtd = parseInt(quantidade) || 1;
    if (qtd > vinil.quant) {
        return res.status(400).send('Quantidade solicitada maior que o estoque disponível');
    }
    
    const total = vinil.preco * qtd;
    const novaCompra = {
        id: nextCompraId++,
        clienteId: parseInt(clienteId),
        vinilId: parseInt(vinilId),
        quantidade: qtd,
        data: new Date().toISOString().split('T')[0],
        total: total
    };
    
    // Atualizar estoque
    vinil.quant -= qtd;
    
    compras.push(novaCompra);
    res.redirect('/compras');
})

// Detalhar compra específica
app.get('/compras/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const compra = compras.find(c => c.id === id);
    if (compra) {
        const cliente = perfis.find(p => p.id === compra.clienteId);
        const vinil = vinis.find(v => v.id === compra.vinilId);
        res.render('detalharCompra', {
            compra: {
                ...compra,
                cliente: cliente || {nome: 'Cliente não encontrado'},
                vinil: vinil || {nome: 'Vinil não encontrado'}
            }
        });
    } else {
        res.status(404).send('Compra não encontrada');
    }
})

// Formulário para editar compra
app.get('/compras/:id/edit', (req, res) => {
    const id = parseInt(req.params.id);
    const compra = compras.find(c => c.id === id);
    if (compra) {
        res.render('editarCompra', {compra, perfis, vinis});
    } else {
        res.status(404).send('Compra não encontrada');
    }
})

// Atualizar compra
app.post('/compras/:id/update', (req, res) => {
    const id = parseInt(req.params.id);
    const {clienteId, vinilId, quantidade, data} = req.body;
    const index = compras.findIndex(c => c.id === id);
    
    if (index !== -1) {
        const compraAntiga = compras[index];
        const vinilAntigo = vinis.find(v => v.id === compraAntiga.vinilId);
        const vinilNovo = vinis.find(v => v.id === parseInt(vinilId));
        
        // Restaurar estoque do vinil antigo
        if (vinilAntigo) {
            vinilAntigo.quant += compraAntiga.quantidade;
        }
        
        // Verificar estoque do novo vinil
        const qtd = parseInt(quantidade) || 1;
        if (qtd > vinilNovo.quant) {
            // Restaurar estoque
            if (vinilAntigo) {
                vinilAntigo.quant -= compraAntiga.quantidade;
            }
            return res.status(400).send('Quantidade solicitada maior que o estoque disponível');
        }
        
        // Atualizar estoque do novo vinil
        vinilNovo.quant -= qtd;
        
        const total = vinilNovo.preco * qtd;
        compras[index] = {
            id,
            clienteId: parseInt(clienteId),
            vinilId: parseInt(vinilId),
            quantidade: qtd,
            data: data || compraAntiga.data,
            total: total
        };
        res.redirect('/compras');
    } else {
        res.status(404).send('Compra não encontrada');
    }
})

// Deletar compra
app.post('/compras/:id/delete', (req, res) => {
    const id = parseInt(req.params.id);
    const index = compras.findIndex(c => c.id === id);
    if (index !== -1) {
        const compra = compras[index];
        const vinil = vinis.find(v => v.id === compra.vinilId);
        
        // Restaurar estoque
        if (vinil) {
            vinil.quant += compra.quantidade;
        }
        
        compras.splice(index, 1);
        res.redirect('/compras');
    } else {
        res.status(404).send('Compra não encontrada');
    }
})






app.listen(port, () => {
    console.log(`Servidor em execução: http://localhost:${port}`);
})