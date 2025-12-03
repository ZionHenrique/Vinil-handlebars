const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR
router.get("/", (req, res) => {
  db.all("SELECT * FROM generos", [], (err, generos) => {
    if (err) return res.send("Erro ao carregar gêneros");
    res.render("generos/listaGeneros", { generos });
  });
});

// ADICIONAR
router.get("/add", (req, res) => res.render("generos/addGenero"));
router.post("/", (req, res) => {
  const { nome, descricao } = req.body;
  db.run(
    "INSERT INTO generos (nome, descricao) VALUES (?, ?)",
    [nome, descricao],
    (err) => {
      if (err) return res.send("Erro ao adicionar gênero");
      res.redirect("/generos");
    }
  );
});

// EDITAR
router.get("/:id/edit", (req, res) => {
  db.get("SELECT * FROM generos WHERE id=?", [req.params.id], (err, genero) => {
    if (err || !genero) return res.send("Gênero não encontrado");
    res.render("generos/editarGenero", { genero });
  });
});

router.post("/:id/update", (req, res) => {
  const { nome, descricao } = req.body;
  db.run(
    "UPDATE generos SET nome=?, descricao=? WHERE id=?",
    [nome, descricao, req.params.id],
    (err) => {
      if (err) return res.send("Erro ao atualizar gênero");
      res.redirect("/generos");
    }
  );
});

// DELETAR
router.post("/:id/delete", (req, res) => {
  db.run("DELETE FROM generos WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send("Erro ao deletar gênero");
    res.redirect("/generos");
  });
});

module.exports = router;
