const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR
router.get("/", (req, res) => {
  db.all("SELECT * FROM artistas", [], (err, artistas) => {
    if (err) return res.send("Erro ao carregar artistas");
    res.render("artistas/listaArtistas", { artistas });
  });
});

// ADICIONAR
router.get("/add", (req, res) => res.render("artistas/addArtista"));
router.post("/", (req, res) => {
  const { nome, pais, ano_inicio, biografia } = req.body;
  db.run(
    "INSERT INTO artistas (nome, pais, ano_inicio, biografia) VALUES (?, ?, ?, ?)",
    [nome, pais, ano_inicio, biografia],
    (err) => {
      if (err) return res.send("Erro ao adicionar artista");
      res.redirect("/artistas");
    }
  );
});

// EDITAR
router.get("/:id/edit", (req, res) => {
  db.get("SELECT * FROM artistas WHERE id=?", [req.params.id], (err, artista) => {
    if (err || !artista) return res.send("Artista não encontrado");
    res.render("artistas/editarArtista", { artista });
  });
});

router.post("/:id/update", (req, res) => {
  const { nome, pais, ano_inicio, biografia } = req.body;
  db.run(
    "UPDATE artistas SET nome=?, pais=?, ano_inicio=?, biografia=? WHERE id=?",
    [nome, pais, ano_inicio, biografia, req.params.id],
    (err) => {
      if (err) return res.send("Erro ao atualizar artista");
      res.redirect("/artistas");
    }
  );
});

// DELETAR
router.post("/:id/delete", (req, res) => {
  db.run("DELETE FROM artistas WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send("Erro ao deletar artista");
    res.redirect("/artistas");
  });
});

module.exports = router;
