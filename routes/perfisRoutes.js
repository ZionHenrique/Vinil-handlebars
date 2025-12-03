const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR CLIENTES
router.get("/", (req, res) => {
  db.all("SELECT * FROM perfis", [], (err, perfis) => {
    if (err) return res.send("Erro ao carregar clientes");
    res.render("perfis/listaPerfis", { perfis });
  });
});

// ADICIONAR CLIENTE (rota específica deve vir antes de /:id)
router.get("/add", (req, res) => res.render("perfis/addPerfil"));

router.post("/", (req, res) => {
  const { nome, email, telefone, endereco } = req.body;
  db.run(
    "INSERT INTO perfis (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)",
    [nome || null, email || null, telefone || null, endereco || null],
    (err) => {
      if (err) {
        console.error("Erro ao adicionar cliente:", err);
        return res.send("Erro ao adicionar cliente: " + err.message);
      }
      res.redirect("/perfis");
    }
  );
});

// DETALHAR PERFIL
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM perfis WHERE id = ?", [req.params.id], (err, perfil) => {
    if (err || !perfil) return res.send("Cliente não encontrado");
    res.render("perfis/detalharPerfil", { perfil });
  });
});

// EDITAR CLIENTE
router.get("/:id/edit", (req, res) => {
  db.get("SELECT * FROM perfis WHERE id=?", [req.params.id], (err, perfil) => {
    if (err || !perfil) return res.send("Cliente não encontrado");
    res.render("perfis/editarPerfil", { perfil });
  });
});

router.post("/:id/update", (req, res) => {
  const { nome, email, telefone, endereco } = req.body;
  db.run(
    "UPDATE perfis SET nome=?, email=?, telefone=?, endereco=? WHERE id=?",
    [nome || null, email || null, telefone || null, endereco || null, req.params.id],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar cliente:", err);
        return res.send("Erro ao atualizar cliente: " + err.message);
      }
      res.redirect("/perfis");
    }
  );
});

// DELETAR CLIENTE
router.post("/:id/delete", (req, res) => {
  db.run("DELETE FROM perfis WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send("Erro ao deletar cliente");
    res.redirect("/perfis");
  });
});

module.exports = router;
