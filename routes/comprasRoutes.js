const express = require("express");
const router = express.Router();
const db = require("../config/database");

// LISTAR (com nomes dos relacionamentos)
router.get("/", (req, res) => {
  const sql = `
    SELECT c.*, p.nome AS clienteNome, v.nome AS vinilNome, v.artista AS vinilArtista
    FROM compras c
    LEFT JOIN perfis p ON c.cliente = p.id
    LEFT JOIN vinis v ON c.vinil = v.id
    ORDER BY c.id DESC
  `;
  db.all(sql, [], (err, compras) => {
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
  const { clienteId, vinilId, quantidade } = req.body;
  const cliente = clienteId || req.body.cliente;
  const vinil = vinilId || req.body.vinil;
  const quantidadeNum = quantidade ? parseInt(quantidade) : 1;

  if (!cliente || !vinil) {
    return res.send("Cliente e vinil são obrigatórios");
  }

  db.get("SELECT * FROM vinis WHERE id=?", [vinil], (err, item) => {
    if (err) {
      console.error("Erro ao buscar vinil:", err);
      return res.send("Erro ao buscar vinil");
    }
    if (!item) return res.send("Vinil não encontrado");

    if (item.quant != null && quantidadeNum > item.quant) {
      return res.send(`Quantidade solicitada (${quantidadeNum}) maior que o estoque (${item.quant}).`);
    }

    const total = item.preco * quantidadeNum;
    const data = new Date().toISOString().split("T")[0];

    // atualizar estoque primeiro
    db.run(
      "UPDATE vinis SET quant = quant - ? WHERE id = ?",
      [quantidadeNum, vinil],
      function (err) {
        if (err) {
          console.error("Erro ao atualizar estoque:", err);
          return res.send("Erro ao atualizar estoque: " + err.message);
        }

        db.run(
          "INSERT INTO compras (cliente, vinil, quantidade, total, data) VALUES (?, ?, ?, ?, ?)",
          [cliente, vinil, quantidadeNum, total, data],
          (err) => {
            if (err) {
              console.error("Erro ao adicionar compra:", err);
              // tentar restaurar estoque em caso de falha
              db.run("UPDATE vinis SET quant = quant + ? WHERE id = ?", [quantidadeNum, vinil]);
              return res.send("Erro ao adicionar compra: " + err.message);
            }
            res.redirect("/compras");
          }
        );
      }
    );
  });
});

// DETALHAR COMPRA
router.get("/:id", (req, res) => {
  // Buscar compra, depois popular cliente e vinil como objetos completos
  db.get("SELECT * FROM compras WHERE id = ?", [req.params.id], (err, compra) => {
    if (err || !compra) return res.send("Compra não encontrada");

    // buscar cliente
    db.get("SELECT * FROM perfis WHERE id = ?", [compra.cliente], (err, cliente) => {
      if (err) cliente = null;
      // buscar vinil
      db.get("SELECT * FROM vinis WHERE id = ?", [compra.vinil], (err, vinil) => {
        if (err) vinil = null;

        // anexar objetos completos para a view
        compra.cliente = cliente || { id: compra.cliente, nome: compra.cliente };
        compra.vinil = vinil || { id: compra.vinil, nome: compra.vinil };
        // manter também campos auxiliares esperados pela lista/edição
        compra.clienteId = compra.cliente.id;
        compra.vinilId = compra.vinil.id;

        res.render("compras/detalharCompra", { compra });
      });
    });
  });
});

// FORM EDITAR
router.get("/:id/edit", (req, res) => {
  db.get("SELECT * FROM compras WHERE id=?", [req.params.id], (err, compra) => {
    if (err || !compra) return res.send("Compra não encontrada");

    // garantir que a view de edição encontre clienteId / vinilId
    compra.clienteId = compra.cliente;
    compra.vinilId = compra.vinil;

    db.all("SELECT * FROM perfis", [], (err, perfis) => {
      if (err) return res.send("Erro ao carregar clientes");
      db.all("SELECT * FROM vinis", [], (err, vinis) => {
        if (err) return res.send("Erro ao carregar vinis");
        res.render("compras/editarCompra", { compra, perfis, vinis });
      });
    });
  });
});

// ATUALIZAR COMPRA (ajusta estoque conforme diferença)
router.post("/:id/update", (req, res) => {
  const { clienteId, vinilId, quantidade } = req.body;
  const novoCliente = clienteId || req.body.cliente;
  const novoVinil = vinilId || req.body.vinil;
  const novaQuantidade = quantidade ? parseInt(quantidade) : 1;

  db.get("SELECT * FROM compras WHERE id=?", [req.params.id], (err, compraOld) => {
    if (err || !compraOld) return res.send("Compra antiga não encontrada");

    // se trocou de vinil, precisaremos devolver o estoque do vinil antigo e retirar do novo
    if (compraOld.vinil === parseInt(novoVinil)) {
      // mesmo vinil: verificar disponibilidade da diferença
      const diff = novaQuantidade - compraOld.quantidade;
      if (diff > 0) {
        // precisa reduzir estoque do vinil atual
        db.get("SELECT quant FROM vinis WHERE id=?", [novoVinil], (err, v) => {
          if (err) return res.send("Erro ao verificar estoque");
          if (v && v.quant != null && diff > v.quant) {
            return res.send(`Quantidade adicional (${diff}) maior que o estoque disponível (${v.quant}).`);
          }
          // aplicar diferença
          db.run("UPDATE vinis SET quant = quant - ? WHERE id=?", [diff, novoVinil], (err) => {
            if (err) return res.send("Erro ao atualizar estoque");
            db.run(
              "UPDATE compras SET cliente=?, vinil=?, quantidade=?, total=?, data=? WHERE id=?",
              [novoCliente, novoVinil, novaQuantidade, (compraOld.total / compraOld.quantidade) * novaQuantidade, compraOld.data, req.params.id],
              (err) => {
                if (err) return res.send("Erro ao atualizar compra");
                res.redirect("/compras");
              }
            );
          });
        });
      } else {
        // diff <= 0: devolver a diferença ao estoque
        const devolver = Math.abs(diff);
        if (devolver > 0) {
          db.run("UPDATE vinis SET quant = quant + ? WHERE id=?", [devolver, novoVinil], (err) => {
            if (err) return res.send("Erro ao atualizar estoque");
            db.run(
              "UPDATE compras SET cliente=?, vinil=?, quantidade=?, total=?, data=? WHERE id=?",
              [novoCliente, novoVinil, novaQuantidade, (compraOld.total / compraOld.quantidade) * novaQuantidade, compraOld.data, req.params.id],
              (err) => {
                if (err) return res.send("Erro ao atualizar compra");
                res.redirect("/compras");
              }
            );
          });
        } else {
          // nenhuma alteração de estoque necessária
          db.run(
            "UPDATE compras SET cliente=?, vinil=?, quantidade=?, total=?, data=? WHERE id=?",
            [novoCliente, novoVinil, novaQuantidade, (compraOld.total / compraOld.quantidade) * novaQuantidade, compraOld.data, req.params.id],
            (err) => {
              if (err) return res.send("Erro ao atualizar compra");
              res.redirect("/compras");
            }
          );
        }
      }
    } else {
      // vinil diferente: devolver estoque do antigo, retirar do novo
      db.get("SELECT quant FROM vinis WHERE id=?", [novoVinil], (err, novoV) => {
        if (err) return res.send("Erro ao verificar novo vinil");
        if (novoV && novoV.quant != null && novaQuantidade > novoV.quant) {
          return res.send(`Quantidade (${novaQuantidade}) maior que o estoque do novo vinil (${novoV.quant}).`);
        }

        // devolver ao antigo
        db.run("UPDATE vinis SET quant = quant + ? WHERE id=?", [compraOld.quantidade, compraOld.vinil], (err) => {
          if (err) console.error("Erro ao devolver estoque ao vinil antigo:", err);

          // retirar do novo
          db.run("UPDATE vinis SET quant = quant - ? WHERE id=?", [novaQuantidade, novoVinil], (err) => {
            if (err) return res.send("Erro ao atualizar estoque do novo vinil");

            db.run(
              "UPDATE compras SET cliente=?, vinil=?, quantidade=?, total=?, data=? WHERE id=?",
              [novoCliente, novoVinil, novaQuantidade, (compraOld.total / compraOld.quantidade) * novaQuantidade, compraOld.data, req.params.id],
              (err) => {
                if (err) return res.send("Erro ao atualizar compra");
                res.redirect("/compras");
              }
            );
          });
        });
      });
    }
  });
});

// DELETAR (restaura estoque)
router.post("/:id/delete", (req, res) => {
  db.get("SELECT * FROM compras WHERE id=?", [req.params.id], (err, compra) => {
    if (err || !compra) return res.send("Compra não encontrada");
    // restaurar estoque
    db.run("UPDATE vinis SET quant = quant + ? WHERE id = ?", [compra.quantidade, compra.vinil], (err) => {
      if (err) console.error("Erro ao restaurar estoque:", err);
      db.run("DELETE FROM compras WHERE id=?", [req.params.id], (err) => {
        if (err) return res.send("Erro ao deletar compra");
        res.redirect("/compras");
      });
    });
  });
});

module.exports = router;