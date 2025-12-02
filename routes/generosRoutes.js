const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Listar
router.get('/', (req, res) => {
    db.all("SELECT * FROM generos", [], (err, rows) => {
        res.render('vinis/listaGeneros', { generos: rows });
    });
});

// Add form
router.get('/add', (req, res) => res.render('vinis/addGenero'));

// Criar
router.post('/', (req, res) => {
    const { nome, descricao } = req.body;

    db.run(`
        INSERT INTO generos (nome, descricao)
        VALUES (?, ?)
    `, [nome, descricao], () => res.redirect('/generos'));
});

// Detalhar
router.get('/:id', (req, res) => {
    db.get("SELECT * FROM generos WHERE id = ?", [req.params.id], (err, genero) => {
        if (!genero) return res.send("Gênero não encontrado");
        res.render("vinis/detalharGenero", { genero });
    });
});

// Editar form
router.get('/:id/edit', (req, res) => {
    db.get("SELECT * FROM generos WHERE id = ?", [req.params.id], (err, genero) => {
        if (!genero) return res.send("Gênero não encontrado");
        res.render("vinis/editarGenero", { genero });
    });
});

// Atualizar
router.post('/:id/update', (req, res) => {
    const { nome, descricao } = req.body;

    db.run(`
        UPDATE generos SET nome=?, descricao=? WHERE id=?
    `, [nome, descricao, req.params.id], () => res.redirect('/generos'));
});

// Deletar
router.post('/:id/delete', (req, res) => {
    db.run("DELETE FROM generos WHERE id = ?", [req.params.id], () => res.redirect('/generos'));
});

module.exports = router;
