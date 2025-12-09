const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR
router.get("/", (req, res) => {
  const sql = `
    SELECT m.*, a.id AS artistaId, a.nome AS artistaNome
    FROM musicas m
    LEFT JOIN artistas a ON a.id = m.artistaId
    ORDER BY m.id DESC
  `;
  db.all(sql, [], (err, musicas) => {
    if (err) return res.send("Erro ao carregar músicas");
    musicas = (musicas || []).map(m => ({
      ...m,
      artistaNome: m.artistaNome || ""
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

  function insertMusica(artistaIdFinal) {
    db.run(
      "INSERT INTO musicas (nome, duracao, artistaId) VALUES (?, ?, ?)",
      [nome || null, duracao || null, artistaIdFinal || null],
      (err) => {
        if (err) {
          console.error("Erro ao adicionar música:", err);
          return res.send("Erro ao adicionar música: " + err.message);
        }
        res.redirect("/musicas");
      }
    );
  }

  // se veio um artistaId confiável, usar direto
  if (artistaId) return insertMusica(artistaId);

  // se veio apenas nome de artista, tentar localizar ou criar
  if (artista) {
    db.get("SELECT id FROM artistas WHERE nome = ?", [artista], (err, row) => {
      if (err) {
        console.error("Erro ao buscar artista:", err);
        return res.send("Erro ao buscar artista");
      }
      if (row && row.id) return insertMusica(row.id);

      // criar artista novo
      db.run("INSERT INTO artistas (nome) VALUES (?)", [artista], function (err) {
        if (err) {
          console.error("Erro ao criar artista:", err);
          return res.send("Erro ao criar artista: " + err.message);
        }
        insertMusica(this.lastID);
      });
    });
    return;
  }

  // nenhum artista informado
  insertMusica(null);
});

// DETALHAR MÚSICA
router.get("/:id", (req, res) => {
  const sql = `
    SELECT m.*, a.id AS artistaId, a.nome AS artistaNome
    FROM musicas m
    LEFT JOIN artistas a ON a.id = m.artistaId
    WHERE m.id = ?
  `;
  db.get(sql, [req.params.id], (err, musica) => {
    if (err || !musica) return res.send("Música não encontrada");
    musica.artistaNome = musica.artistaNome || "";
    res.render("musicas/detalharMusica", { musica });
  });
});

// EDITAR
router.get("/:id/edit", (req, res) => {
  // buscar a música e todos artistas para popular o select
  const sql = `
    SELECT m.*, a.id AS artistaId, a.nome AS artistaNome
    FROM musicas m
    LEFT JOIN artistas a ON a.id = m.artistaId
    WHERE m.id = ?
  `;
  db.get(sql, [req.params.id], (err, musica) => {
    if (err || !musica) return res.send("Música não encontrada");

    // carregar todos artistas
    db.all("SELECT * FROM artistas", [], (err, artistas) => {
      if (err) return res.send("Erro ao carregar artistas para edição");

      musica.artistaId = musica.artistaId || null;
      res.render("musicas/editarMusica", { musica, artistas });
    });
  });
});

router.post("/:id/update", (req, res) => {
  const { nome, duracao, artista, artistaId } = req.body;

  function doUpdate(artistaIdFinal) {
    db.run(
      "UPDATE musicas SET nome=?, duracao=?, artistaId=? WHERE id= ?",
      [nome || null, duracao || null, artistaIdFinal || null, req.params.id],
      (err) => {
        if (err) {
          console.error("Erro ao atualizar música:", err);
          return res.send("Erro ao atualizar música: " + err.message);
        }
        res.redirect("/musicas");
      }
    );
  }

  if (artistaId) return doUpdate(artistaId);

  if (artista) {
    db.get("SELECT id FROM artistas WHERE nome = ?", [artista], (err, row) => {
      if (err) {
        console.error("Erro ao buscar artista:", err);
        return res.send("Erro ao buscar artista");
      }
      if (row && row.id) return doUpdate(row.id);

      db.run("INSERT INTO artistas (nome) VALUES (?)", [artista], function (err) {
        if (err) {
          console.error("Erro ao criar artista:", err);
          return res.send("Erro ao criar artista: " + err.message);
        }
        doUpdate(this.lastID);
      });
    });
    return;
  }

  doUpdate(null);
});

// DELETAR
router.post("/:id/delete", (req, res) => {
  db.run("DELETE FROM musicas WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send("Erro ao deletar música");
    res.redirect("/musicas");
  });
});

module.exports = router;