const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR
router.get("/", (req, res) => {
  db.all("SELECT * FROM distribuidoras", [], (err, distribuidoras) => {
    if (err) return res.send("Erro ao carregar distribuidoras");
    res.render("distribuidoras/listaDistribuidoras", { distribuidoras });
  });
});

// ADICIONAR
router.get("/add", (req, res) => res.render("distribuidoras/addDistribuidora"));

router.post("/", (req, res) => {
  const { nome, pais, contato, descricao } = req.body;
  db.run(
    "INSERT INTO distribuidoras (nome, pais, contato, descricao) VALUES (?, ?, ?, ?)",
    [nome || null, pais || null, contato || null, descricao || null],
    (err) => {
      if (err) {
        console.error("Erro ao adicionar distribuidora:", err);
        return res.send("Erro ao adicionar distribuidora: " + err.message);
      }
      res.redirect("/distribuidoras");
    }
  );
});

// DETALHAR
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM distribuidoras WHERE id = ?", [req.params.id], (err, distribuidora) => {
    if (err || !distribuidora) return res.send("Distribuidora não encontrada");
    res.render("distribuidoras/detalharDistribuidora", { distribuidora });
  });
});

// EDITAR
router.get("/:id/edit", (req, res) => {
  db.get("SELECT * FROM distribuidoras WHERE id=?", [req.params.id], (err, distribuidora) => {
    if (err || !distribuidora) return res.send("Distribuidora não encontrada");
    res.render("distribuidoras/editarDistribuidora", { distribuidora });
  });
});

router.post("/:id/update", (req, res) => {
  const { nome, pais, contato, descricao } = req.body;
  db.run(
    "UPDATE distribuidoras SET nome=?, pais=?, contato=?, descricao=? WHERE id=?",
    [nome || null, pais || null, contato || null, descricao || null, req.params.id],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar distribuidora:", err);
        return res.send("Erro ao atualizar distribuidora: " + err.message);
      }
      res.redirect("/distribuidoras");
    }
  );
});

// DELETAR
router.post("/:id/delete", (req, res) => {
  db.run("DELETE FROM distribuidoras WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send("Erro ao deletar distribuidora");
    res.redirect("/distribuidoras");
  });
});

module.exports = router;