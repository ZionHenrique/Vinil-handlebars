const db = require('../config/database');

function normalizeGenero(g) {
  if (g === null || g === undefined) return null;
  if (typeof g !== 'string') g = String(g);
  let s = g.trim();
  // try JSON parse
  if ((s.startsWith('[') && s.endsWith(']')) || s.startsWith('{')) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) s = parsed.join(', ');
      else if (typeof parsed === 'string') s = parsed;
      else s = String(parsed);
    } catch (e) {
      // continue
    }
  }
  // remove stray brackets/quotes
  s = s.replace(/[\[\]"']+/g, '');
  // split by comma, trim, lowercase, remove empty, remove duplicates
  const parts = s.split(',').map(p => p.trim().toLowerCase()).filter(p => p.length > 0);
  const unique = [...new Set(parts)];
  return unique.join(', ');
}

console.log('Normalizing vinis.genero to lowercase, trimmed and deduped...');

db.serialize(() => {
  db.all('SELECT id, nome, genero FROM vinis', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar vinis:', err);
      process.exit(1);
    }
    let total = rows.length;
    if (total === 0) {
      console.log('Nenhum vinil encontrado.');
      process.exit(0);
    }
    let processed = 0;
    let changed = 0;
    rows.forEach(r => {
      const before = r.genero || '';
      const after = normalizeGenero(before);
      if ((before || '') !== (after || '')) {
        db.run('UPDATE vinis SET genero = ? WHERE id = ?', [after, r.id], function(uerr) {
          if (uerr) console.error('Erro ao atualizar id', r.id, uerr);
          else {
            changed++;
            console.log(`UPDATED id=${r.id} : "${before}" -> "${after}"`);
          }
          processed++;
          if (processed === total) finish();
        });
      } else {
        console.log(`SKIP id=${r.id} : "${before}" (no change)`);
        processed++;
        if (processed === total) finish();
      }
    });
    function finish() {
      console.log(`Done. ${changed} updated, ${total - changed} unchanged (out of ${total}).`);
      process.exit(0);
    }
  });
});
