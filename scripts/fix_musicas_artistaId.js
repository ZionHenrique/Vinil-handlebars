// Script para adicionar coluna artistaId na tabela musicas se não existir
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database', 'vinil.db');
const db = new sqlite3.Database(dbPath);

console.log('Verificando estrutura da tabela musicas...');

// Verificar se a coluna artistaId existe
db.all("PRAGMA table_info(musicas)", [], (err, columns) => {
  if (err) {
    console.error('Erro ao verificar estrutura:', err);
    db.close();
    return;
  }

  const hasArtistaId = columns.some(col => col.name === 'artistaId');
  
  if (!hasArtistaId) {
    console.log('Coluna artistaId não encontrada. Adicionando...');
    
    // Adicionar coluna artistaId
    db.run("ALTER TABLE musicas ADD COLUMN artistaId INTEGER", (err) => {
      if (err) {
        console.error('Erro ao adicionar coluna:', err);
      } else {
        console.log('✓ Coluna artistaId adicionada com sucesso!');
        
        // Tentar atualizar músicas existentes que têm o campo artista (texto)
        // para usar artistaId baseado no nome
        db.all("SELECT id, artista FROM musicas WHERE artista IS NOT NULL AND artista != ''", [], (err, musicas) => {
          if (err) {
            console.error('Erro ao buscar músicas:', err);
            db.close();
            return;
          }

          if (musicas.length > 0) {
            console.log(`Encontradas ${musicas.length} músicas com campo artista. Tentando atualizar...`);
            
            let updated = 0;
            let processed = 0;
            
            musicas.forEach((musica) => {
              // Buscar artista pelo nome
              db.get("SELECT id FROM artistas WHERE nome = ?", [musica.artista], (err, artista) => {
                processed++;
                
                if (err) {
                  console.error(`Erro ao buscar artista "${musica.artista}":`, err);
                } else if (artista) {
                  // Atualizar música com artistaId
                  db.run("UPDATE musicas SET artistaId = ? WHERE id = ?", [artista.id, musica.id], (err) => {
                    if (err) {
                      console.error(`Erro ao atualizar música ${musica.id}:`, err);
                    } else {
                      updated++;
                      console.log(`✓ Música "${musica.artista}" atualizada com artistaId ${artista.id}`);
                    }
                    
                    if (processed === musicas.length) {
                      console.log(`\nProcessamento concluído: ${updated} de ${musicas.length} músicas atualizadas.`);
                      db.close();
                    }
                  });
                } else {
                  console.log(`⚠ Artista "${musica.artista}" não encontrado para música ID ${musica.id}`);
                  
                  if (processed === musicas.length) {
                    console.log(`\nProcessamento concluído: ${updated} de ${musicas.length} músicas atualizadas.`);
                    db.close();
                  }
                }
              });
            });
          } else {
            console.log('Nenhuma música com campo artista encontrada.');
            db.close();
          }
        });
      }
    });
  } else {
    console.log('✓ Coluna artistaId já existe na tabela musicas.');
    
    // Verificar se há músicas sem artistaId mas com artista (texto)
    db.all("SELECT COUNT(*) as count FROM musicas WHERE (artistaId IS NULL OR artistaId = '') AND artista IS NOT NULL AND artista != ''", [], (err, result) => {
      if (err) {
        console.error('Erro ao verificar músicas:', err);
        db.close();
        return;
      }
      
      const count = result[0]?.count || 0;
      if (count > 0) {
        console.log(`\n⚠ Encontradas ${count} músicas com campo artista mas sem artistaId.`);
        console.log('Execute este script novamente para tentar atualizar automaticamente.');
      } else {
        console.log('✓ Todas as músicas estão com artistaId preenchido ou sem artista.');
      }
      
      db.close();
    });
  }
});

