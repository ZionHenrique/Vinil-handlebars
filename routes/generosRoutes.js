const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Listar
router.get('/', (req, res) => {
    db.all("SELECT * FROM generos", [], (err, rows) => {
        res.render('generos/listaGeneros', { generos: rows });
    });
});

// Add form
router.get('/add', (req, res) => {
    const redirect = req.query.redirect || "/generos";
    res.render('generos/addGenero', { redirect });
});

// Criar
router.post('/', (req, res) => {
    const { nome, descricao, redirect } = req.body;
    const redirectUrl = redirect || "/generos";
    
    console.log("Criando gênero:", { nome, descricao, redirect, redirectUrl });

    db.run(`
        INSERT INTO generos (nome, descricao)
        VALUES (?, ?)
    `, [nome, descricao], (err) => {
        if (err) {
            console.error("Erro ao inserir gênero:", err);
            return res.send("Erro ao adicionar gênero: " + err.message);
        }
        console.log("Gênero criado, redirecionando para:", redirectUrl);
        res.redirect(redirectUrl);
    });
});

// Detalhar
router.get('/:id', (req, res) => {
    db.get("SELECT * FROM generos WHERE id = ?", [req.params.id], (err, genero) => {
        if (!genero) return res.send("Gênero não encontrado");
        res.render("generos/detalharGenero", { genero });
    });
});

// Editar form
router.get('/:id/edit', (req, res) => {
    db.get("SELECT * FROM generos WHERE id = ?", [req.params.id], (err, genero) => {
        if (!genero) return res.send("Gênero não encontrado");
        res.render("generos/editarGenero", { genero });
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
