// Script para verificar músicas e seus artistaIds
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database', 'vinil.db');
const db = new sqlite3.Database(dbPath);

console.log('Verificando músicas e artistas...\n');

// Listar todas as músicas
db.all("SELECT id, nome, duracao, artistaId FROM musicas", [], (err, musicas) => {
  if (err) {
    console.error('Erro ao buscar músicas:', err);
    db.close();
    return;
  }

  console.log(`Total de músicas: ${musicas.length}\n`);

  if (musicas.length === 0) {
    console.log('Nenhuma música cadastrada ainda.');
    db.close();
    return;
  }

  musicas.forEach((musica, index) => {
    console.log(`${index + 1}. ${musica.nome || '(sem nome)'}`);
    console.log(`   ID: ${musica.id}`);
    console.log(`   Duração: ${musica.duracao || 'N/A'}`);
    console.log(`   artistaId: ${musica.artistaId || 'NULL (sem artista associado)'}`);
    
    if (musica.artistaId) {
      // Buscar nome do artista
      db.get("SELECT nome FROM artistas WHERE id = ?", [musica.artistaId], (err, artista) => {
        if (artista) {
          console.log(`   Artista: ${artista.nome}`);
        } else {
          console.log(`   ⚠ Artista com ID ${musica.artistaId} não encontrado!`);
        }
        console.log('');
      });
    } else {
      console.log('');
    }
  });

  // Listar artistas
  db.all("SELECT id, nome FROM artistas", [], (err, artistas) => {
    if (err) {
      console.error('Erro ao buscar artistas:', err);
      db.close();
      return;
    }

    console.log(`\nTotal de artistas: ${artistas.length}`);
    artistas.forEach((artista) => {
      // Contar músicas de cada artista
      db.get("SELECT COUNT(*) as count FROM musicas WHERE artistaId = ?", [artista.id], (err, result) => {
        const count = result?.count || 0;
        console.log(`  - ${artista.nome} (ID: ${artista.id}) - ${count} música(s)`);
      });
    });

    setTimeout(() => {
      db.close();
    }, 1000);
  });
});

