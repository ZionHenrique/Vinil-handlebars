const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR VINIS
router.get("/", (req, res) => {
  db.all("SELECT * FROM vinis", [], (err, vinis) => {
    if (err) return res.send("Erro ao carregar vinis");
    res.render("vinis/listaVinis", { vinis });
  });
});

// FORMULÁRIO DE ADIÇÃO
router.get("/add", (req, res) => {
  db.all("SELECT * FROM generos", [], (err, generos) => {
    if (err) return res.send("Erro ao carregar gêneros");
    res.render("vinis/addVinil", { generos });
  });
});

// CRIAR VINIL
router.post("/", (req, res) => {
  const { nome, artista, preco, quant, genero, ano } = req.body;
  const generoStr = Array.isArray(genero) ? genero.join(", ") : genero || null;
  const precoNum = preco ? parseFloat(preco) : null;
  const quantNum = quant ? parseInt(quant) : null;
  const anoNum = ano ? parseInt(ano) : null;
  
  db.run(
    "INSERT INTO vinis (nome, artista, preco, quant, genero, ano) VALUES (?, ?, ?, ?, ?, ?)",
    [nome || null, artista || null, precoNum, quantNum, generoStr, anoNum],
    (err) => {
      if (err) {
        console.error("Erro ao adicionar vinil:", err);
        return res.send("Erro ao adicionar vinil: " + err.message);
      }
      res.redirect("/vinis");
    }
  );
});

// DETALHAR VINIL
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM vinis WHERE id = ?", [req.params.id], (err, vinil) => {
    if (err || !vinil) return res.send("Vinil não encontrado");
    res.render("vinis/detalharVinil", { vinil });
  });
});

// FORMULÁRIO DE EDIÇÃO
router.get("/:id/edit", (req, res) => {
  db.get("SELECT * FROM vinis WHERE id = ?", [req.params.id], (err, vinil) => {
    if (err || !vinil) return res.send("Vinil não encontrado");
    db.all("SELECT * FROM generos", [], (err, generos) => {
      if (err) return res.send("Erro ao carregar gêneros");
      vinil.generosSelecionados = vinil.genero ? vinil.genero.split(", ") : [];
      res.render("vinis/editarVinil", { vinil, generos });
    });
  });
});

// ATUALIZAR VINIL
router.post("/:id/update", (req, res) => {
  const { nome, artista, preco, quant, genero, ano } = req.body;
  const generoStr = Array.isArray(genero) ? genero.join(", ") : genero || null;
  const precoNum = preco ? parseFloat(preco) : null;
  const quantNum = quant ? parseInt(quant) : null;
  const anoNum = ano ? parseInt(ano) : null;
  
  db.run(
    "UPDATE vinis SET nome=?, artista=?, preco=?, quant=?, genero=?, ano=? WHERE id=?",
    [nome || null, artista || null, precoNum, quantNum, generoStr, anoNum, req.params.id],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar vinil:", err);
        return res.send("Erro ao atualizar vinil: " + err.message);
      }
      res.redirect("/vinis");
    }
  );
});

// DELETAR VINIL
router.post("/:id/delete", (req, res) => {
  db.run("DELETE FROM vinis WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send("Erro ao deletar vinil");
    res.redirect("/vinis");
  });
});

module.exports = router;
