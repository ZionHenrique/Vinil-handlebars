const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Listar artistas
router.get("/", (req, res) => {
    db.all("SELECT * FROM artistas", [], (err, rows) => {
        if (err) return res.send("Erro ao listar artistas.");
        res.render("artistas/listaArtistas", { artistas: rows });
    });
});

// Form add
router.get("/add", (req, res) => {
    const redirect = req.query.redirect || "/artistas";
    res.render("artistas/addArtista", { redirect });
});

// Criar artista
router.post("/", (req, res) => {
    const { nome, pais, ano_inicio, redirect } = req.body;
    const redirectUrl = redirect || "/artistas";
    
    console.log("Criando artista:", { nome, pais, ano_inicio, redirect, redirectUrl });

    db.run(
        "INSERT INTO artistas (nome, pais, ano_inicio) VALUES (?, ?, ?)",
        [nome, pais, ano_inicio],
        (err) => {
            if (err) {
                console.error("Erro ao inserir artista:", err);
                return res.send("Erro ao adicionar artista: " + err.message);
            }
            console.log("Artista criado, redirecionando para:", redirectUrl);
            res.redirect(redirectUrl);
        }
    );
});

// Detalhar
router.get("/:id", (req, res) => {
    db.get("SELECT * FROM artistas WHERE id = ?", [req.params.id], (err, artista) => {
        if (!artista) return res.send("Artista não encontrado.");
        res.render("artistas/detalharArtista", { artista });
    });
});

// Editar form
router.get("/:id/edit", (req, res) => {
    db.get("SELECT * FROM artistas WHERE id = ?", [req.params.id], (err, artista) => {
        if (!artista) return res.send("Artista não encontrado.");
        res.render("artistas/editarArtista", { artista });
    });
});

// Atualizar
router.post("/:id/update", (req, res) => {
    const { nome, pais, ano_inicio } = req.body;

    db.run(
        "UPDATE artistas SET nome=?, pais=?, ano_inicio=? WHERE id=?",
        [nome, pais, ano_inicio, req.params.id],
        () => res.redirect("/artistas")
    );
});

// Deletar
router.post("/:id/delete", (req, res) => {
    db.run("DELETE FROM artistas WHERE id = ?", [req.params.id], () => res.redirect("/artistas"));
});

module.exports = router;
