const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Listar
router.get('/', (req, res) => {
    db.all("SELECT * FROM perfis", [], (err, rows) => {
        res.render('perfis/listaPerfis', { perfis: rows });
    });
});

// Adicionar form
router.get('/add', (req, res) => res.render('perfis/addPerfil'));

// Criar
router.post('/', (req, res) => {
    const { nome, email, telefone, endereco } = req.body;

    db.run(`
        INSERT INTO perfis (nome, email, telefone, endereco)
        VALUES (?, ?, ?, ?)
    `, [nome, email, telefone, endereco], () => res.redirect('/perfis'));
});

// Detalhar
router.get('/:id', (req, res) => {
    db.get("SELECT * FROM perfis WHERE id = ?", [req.params.id], (err, perfil) => {
        if (!perfil) return res.send("Perfil não encontrado");
        res.render("perfis/detalharPerfil", { perfil });
    });
});

// Editar form
router.get('/:id/edit', (req, res) => {
    db.get("SELECT * FROM perfis WHERE id = ?", [req.params.id], (err, perfil) => {
        if (!perfil) return res.send("Perfil não encontrado");
        res.render("perfis/editarPerfil", { perfil });
    });
});

// Atualizar
router.post('/:id/update', (req, res) => {
    const { nome, email, telefone, endereco } = req.body;

    db.run(`
        UPDATE perfis SET nome=?, email=?, telefone=?, endereco=?
        WHERE id=?
    `, [nome, email, telefone, endereco, req.params.id], () => res.redirect('/perfis'));
});

// Deletar
router.post('/:id/delete', (req, res) => {
    db.run("DELETE FROM perfis WHERE id = ?", [req.params.id], () => res.redirect('/perfis'));
});

module.exports = router;
