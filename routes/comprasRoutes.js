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
  const { cliente, vinil, clienteId, vinilId, quantidade } = req.body;
  const clienteIdFinal = cliente || clienteId;
  const vinilIdFinal = vinil || vinilId;
  const quantidadeNum = quantidade ? parseInt(quantidade) : 1;

  if (!clienteIdFinal || !vinilIdFinal) {
    return res.send("Cliente e vinil são obrigatórios");
  }

  db.get("SELECT * FROM vinis WHERE id=?", [vinilIdFinal], (err, item) => {
    if (err) {
      console.error("Erro ao buscar vinil:", err);
      return res.send("Erro ao buscar vinil");
    }
    if (!item) return res.send("Vinil não encontrado");

    const total = item.preco * quantidadeNum;
    const data = new Date().toISOString().split("T")[0];

    db.run(
      "INSERT INTO compras (cliente, vinil, quantidade, total, data) VALUES (?, ?, ?, ?, ?)",
      [clienteIdFinal, vinilIdFinal, quantidadeNum, total, data],
      (err) => {
        if (err) {
          console.error("Erro ao adicionar compra:", err);
          return res.send("Erro ao adicionar compra: " + err.message);
        }
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

