const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR
router.get("/", (req, res) => {
  const sql = `
    SELECT m.*, a.id AS artistaId, a.nome AS artistaNome
    FROM musicas m
    LEFT JOIN artistas a ON a.nome = m.artista
    ORDER BY m.id DESC
  `;
  db.all(sql, [], (err, musicas) => {
    if (err) return res.send("Erro ao carregar músicas");
    // garantir que cada objeto tenha artistaNome (fallback para m.artista)
    musicas = musicas.map(m => ({
      ...m,
      artistaNome: m.artistaNome || m.artista || ""
    }));
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
  const sql = `
    SELECT m.*, a.id AS artistaId, a.nome AS artistaNome
    FROM musicas m
    LEFT JOIN artistas a ON a.nome = m.artista
    WHERE m.id = ?
  `;
  db.get(sql, [req.params.id], (err, musica) => {
    if (err || !musica) return res.send("Música não encontrada");
    musica.artistaNome = musica.artistaNome || musica.artista || "";
    res.render("musicas/detalharMusica", { musica });
  });
});

// EDITAR
router.get("/:id/edit", (req, res) => {
  // buscar a música e todos artistas para popular o select
  const sql = `
    SELECT m.*, a.id AS artistaId, a.nome AS artistaNome
    FROM musicas m
    LEFT JOIN artistas a ON a.nome = m.artista
    WHERE m.id = ?
  `;
  db.get(sql, [req.params.id], (err, musica) => {
    if (err || !musica) return res.send("Música não encontrada");

    // carregar todos artistas
    db.all("SELECT * FROM artistas", [], (err, artistas) => {
      if (err) return res.send("Erro ao carregar artistas para edição");

      // definir artistaId com base na ligação (se houver)
      musica.artistaId = musica.artistaId || null;
      res.render("musicas/editarMusica", { musica, artistas });
    });
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