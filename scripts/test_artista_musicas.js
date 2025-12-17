// Script para testar a query de músicas por artista
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database', 'vinil.db');
const db = new sqlite3.Database(dbPath);

console.log('Testando busca de músicas por artista...\n');

// Listar todos os artistas e suas músicas
db.all("SELECT id, nome FROM artistas", [], (err, artistas) => {
  if (err) {
    console.error('Erro ao buscar artistas:', err);
    db.close();
    return;
  }

  artistas.forEach((artista, index) => {
    console.log(`\n${index + 1}. Artista: ${artista.nome} (ID: ${artista.id})`);
    
    // Testar a mesma query que está na rota
    db.all(
      "SELECT * FROM musicas WHERE artistaId = ? ORDER BY nome ASC",
      [artista.id],
      (err, musicas) => {
        if (err) {
          console.error(`  Erro ao buscar músicas:`, err);
        } else {
          console.log(`  Músicas encontradas: ${musicas.length}`);
          if (musicas.length > 0) {
            musicas.forEach((musica) => {
              console.log(`    - ${musica.nome} (ID: ${musica.id}, artistaId: ${musica.artistaId})`);
            });
          } else {
            console.log(`    (nenhuma música)`);
          }
        }
        
        // Se for o último artista, fechar o banco
        if (index === artistas.length - 1) {
          setTimeout(() => {
            db.close();
          }, 500);
        }
      }
    );
  });
});

