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

// ADICIONAR (rota específica deve vir antes de /:id)
router.get("/add", (req, res) => {
  db.all("SELECT * FROM artistas", [], (err, artistas) => {
    if (err) return res.send("Erro ao carregar artistas");
    res.render("musicas/addMusica", { artistas: artistas || [] });
  });
});

router.post("/", (req, res) => {
  const { nome, duracao, artista, artistaId } = req.body;
  let artistaFinal = artista || null;
  
  // Se foi enviado um ID, buscar o nome do artista
  if (artistaId && !artistaFinal) {
    db.get("SELECT nome FROM artistas WHERE id = ?", [artistaId], (err, artistaRow) => {
      if (err) {
        console.error("Erro ao buscar artista:", err);
        return res.send("Erro ao buscar artista");
      }
      artistaFinal = artistaRow ? artistaRow.nome : null;
      
      db.run(
        "INSERT INTO musicas (nome, duracao, artista) VALUES (?, ?, ?)",
        [nome || null, duracao || null, artistaFinal],
        (err) => {
          if (err) {
            console.error("Erro ao adicionar música:", err);
            return res.send("Erro ao adicionar música: " + err.message);
          }
          res.redirect("/musicas");
        }
      );
    });
  } else {
    db.run(
      "INSERT INTO musicas (nome, duracao, artista) VALUES (?, ?, ?)",
      [nome || null, duracao || null, artistaFinal],
      (err) => {
        if (err) {
          console.error("Erro ao adicionar música:", err);
          return res.send("Erro ao adicionar música: " + err.message);
        }
        res.redirect("/musicas");
      }
    );
  }
});

// DETALHAR MÚSICA
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM musicas WHERE id = ?", [req.params.id], (err, musica) => {
    if (err || !musica) return res.send("Música não encontrada");
    res.render("musicas/detalharMusica", { musica });
  });
});

// EDITAR
router.get("/:id/edit", (req, res) => {
  db.get("SELECT * FROM musicas WHERE id=?", [req.params.id], (err, musica) => {
    if (err || !musica) return res.send("Música não encontrada");
    res.render("musicas/editarMusica", { musica });
  });
});

router.post("/:id/update", (req, res) => {
  const { nome, duracao, artista, artistaId } = req.body;
  let artistaFinal = artista || null;
  
  // Se foi enviado um ID, buscar o nome do artista
  if (artistaId && !artistaFinal) {
    db.get("SELECT nome FROM artistas WHERE id = ?", [artistaId], (err, artistaRow) => {
      if (err) {
        console.error("Erro ao buscar artista:", err);
        return res.send("Erro ao buscar artista");
      }
      artistaFinal = artistaRow ? artistaRow.nome : null;
      
      db.run(
        "UPDATE musicas SET nome=?, duracao=?, artista=? WHERE id=?",
        [nome || null, duracao || null, artistaFinal, req.params.id],
        (err) => {
          if (err) {
            console.error("Erro ao atualizar música:", err);
            return res.send("Erro ao atualizar música: " + err.message);
          }
          res.redirect("/musicas");
        }
      );
    });
  } else {
    db.run(
      "UPDATE musicas SET nome=?, duracao=?, artista=? WHERE id=?",
      [nome || null, duracao || null, artistaFinal, req.params.id],
      (err) => {
        if (err) {
          console.error("Erro ao atualizar música:", err);
          return res.send("Erro ao atualizar música: " + err.message);
        }
        res.redirect("/musicas");
      }
    );
  }
});

// DELETAR
router.post("/:id/delete", (req, res) => {
  db.run("DELETE FROM musicas WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send("Erro ao deletar música");
    res.redirect("/musicas");
  });
});

module.exports = router;

