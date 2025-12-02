const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Listar vinis
router.get('/', (req, res) => {
    db.all("SELECT * FROM vinis", [], (err, rows) => {
        if (err) return res.send("Erro: " + err.message);
        rows.forEach(v => v.genero = v.genero ? v.genero.split(",") : []);
        res.render('vinis/listaVinis', { vinis: rows });
    });
});

// Form adicionar
router.get('/add', (req, res) => {
    db.all("SELECT * FROM generos", [], (err, generos) => {
        if (err) {
            console.error("Erro ao buscar gêneros:", err);
            generos = [];
        }
        db.all("SELECT * FROM artistas ORDER BY nome", [], (err, artistas) => {
            if (err) {
                console.error("Erro ao buscar artistas:", err);
                artistas = [];
            }
            console.log("Artistas encontrados:", artistas.length);
            console.log("Artistas:", JSON.stringify(artistas, null, 2));
            res.render('vinis/addVinis', { generos: generos || [], artistas: artistas || [] });
        });
    });
});

// Criar
router.post('/', (req, res) => {
    const { nome, artista, preco, ano, genero, quant } = req.body;

    db.run(`
        INSERT INTO vinis (nome, artista, preco, ano, genero, quant)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [nome, artista, preco, ano, genero, quant], () => res.redirect('/vinis'));
});

// Detalhar
router.get('/:id', (req, res) => {
    db.get("SELECT * FROM vinis WHERE id = ?", [req.params.id], (err, vinil) => {
        if (!vinil) return res.send("Vinil não encontrado");
        vinil.genero = vinil.genero ? vinil.genero.split(",") : [];
        res.render("vinis/detalharVinil", { vinil });
    });
});

// Editar form
router.get('/:id/edit', (req, res) => {
    db.get("SELECT * FROM vinis WHERE id = ?", [req.params.id], (err, vinil) => {
        if (!vinil) return res.send("Vinil não encontrado");

        db.all("SELECT * FROM generos ORDER BY nome", [], (err, generos) => {
            if (err) generos = [];
            db.all("SELECT * FROM artistas ORDER BY nome", [], (err, artistas) => {
                if (err) artistas = [];
                res.render("vinis/editarVinil", { vinil, generos, artistas });
            });
        });
    });
});

// Atualizar
router.post('/:id/update', (req, res) => {
    const { nome, artista, preco, ano, genero, quant } = req.body;

    db.run(`
        UPDATE vinis SET nome=?, artista=?, preco=?, ano=?, genero=?, quant=?
        WHERE id=?
    `, [nome, artista, preco, ano, genero, quant, req.params.id], () => res.redirect('/vinis'));
});

// Deletar
router.post('/:id/delete', (req, res) => {
    db.run("DELETE FROM vinis WHERE id = ?", [req.params.id], () => res.redirect('/vinis'));
});

module.exports = router;
