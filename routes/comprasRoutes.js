const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR
router.get("/", (req, res) => {
  db.all("SELECT * FROM compras", [], (err, compras) => {
    if (err) return res.send("Erro ao carregar compras");
    res.render("compras/listaCompras", { compras });
  });
});

// ADD FORM
router.get("/add", (req, res) => {
  db.all("SELECT * FROM perfis", [], (err, perfis) => {
    if (err) return res.send("Erro ao carregar clientes");
    db.all("SELECT * FROM vinis", [], (err, vinis) => {
      if (err) return res.send("Erro ao carregar vinis");
      res.render("compras/addCompra", { perfis, vinis });
    });
  });
});

// CRIAR
router.post("/", (req, res) => {
  const { cliente, vinil, quantidade } = req.body;

  db.get("SELECT * FROM vinis WHERE id=?", [vinil], (err, item) => {
    if (err || !item) return res.send("Vinil não encontrado");

    const total = item.preco * quantidade;
    const data = new Date().toISOString().split("T")[0];

    db.run(
      "INSERT INTO compras (cliente, vinil, quantidade, total, data) VALUES (?, ?, ?, ?, ?)",
      [cliente, vinil, quantidade, total, data],
      (err) => {
        if (err) return res.send("Erro ao adicionar compra");
        res.redirect("/compras");
      }
    );
  });
});

// DELETAR
router.post("/:id/delete", (req, res) => {
  db.run("DELETE FROM compras WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send("Erro ao deletar compra");
    res.redirect("/compras");
  });
});

module.exports = router;

