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

// ADICIONAR (rota específica deve vir antes de /:id)
router.get("/add", (req, res) => res.render("artistas/addArtista"));
router.post("/", (req, res) => {
  const { nome, pais, ano_inicio, biografia } = req.body;
  const anoInicio = ano_inicio ? parseInt(ano_inicio) : null;
  db.run(
    "INSERT INTO artistas (nome, pais, ano_inicio, biografia) VALUES (?, ?, ?, ?)",
    [nome || null, pais || null, anoInicio, biografia || null],
    (err) => {
      if (err) {
        console.error("Erro ao adicionar artista:", err);
        return res.send("Erro ao adicionar artista");
      }
      res.redirect("/artistas");
    }
  );
});

// DETALHAR ARTISTA
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM artistas WHERE id = ?", [req.params.id], (err, artista) => {
    if (err || !artista) return res.send("Artista não encontrado");
    
    // Buscar músicas relacionadas (associação bidirecional 1:N)
    db.all(
      "SELECT * FROM musicas WHERE artistaId = ? ORDER BY nome ASC",
      [req.params.id],
      (err, musicas) => {
        if (err) musicas = [];
        artista.musicas = musicas || [];
        res.render("artistas/detalharArtista", { artista });
      }
    );
  });
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
  const anoInicio = ano_inicio ? parseInt(ano_inicio) : null;
  db.run(
    "UPDATE artistas SET nome=?, pais=?, ano_inicio=?, biografia=? WHERE id=?",
    [nome || null, pais || null, anoInicio, biografia || null, req.params.id],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar artista:", err);
        return res.send("Erro ao atualizar artista");
      }
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
