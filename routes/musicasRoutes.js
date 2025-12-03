const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR
router.get("/", (req, res) => {
  db.all("SELECT * FROM musicas", [], (err, musicas) => {
    if (err) return res.send("Erro ao carregar músicas");
    res.render("musicas/listaMusicas", { musicas });
  });
});

// ADICIONAR
router.get("/add", (req, res) => res.render("musicas/addMusica"));
router.post("/", (req, res) => {
  const { nome, duracao, artista } = req.body;
  db.run(
    "INSERT INTO musicas (nome, duracao, artista) VALUES (?, ?, ?)",
    [nome, duracao, artista],
    (err) => {
      if (err) return res.send("Erro ao adicionar música");
      res.redirect("/musicas");
    }
  );
});

// EDITAR
router.get("/:id/edit", (req, res) => {
  db.get("SELECT * FROM musicas WHERE id=?", [req.params.id], (err, musica) => {
    if (err || !musica) return res.send("Música não encontrada");
    res.render("musicas/editarMusica", { musica });
  });
});

router.post("/:id/update", (req, res) => {
  const { nome, duracao, artista } = req.body;
  db.run(
    "UPDATE musicas SET nome=?, duracao=?, artista=? WHERE id=?",
    [nome, duracao, artista, req.params.id],
    (err) => {
      if (err) return res.send("Erro ao atualizar música");
      res.redirect("/musicas");
    }
  );
});

// DELETAR
router.post("/:id/delete", (req, res) => {
  db.run("DELETE FROM musicas WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send("Erro ao deletar música");
    res.redirect("/musicas");
  });
});

module.exports = router;

