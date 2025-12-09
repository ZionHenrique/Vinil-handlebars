const db = require('../config/database');

function normalizeGenero(g) {
  if (g === null || g === undefined) return null;
  if (typeof g !== 'string') return String(g);
  const original = g;
  g = g.trim();

  // try JSON parse when looks like array or JSON
  if ((g.startsWith('[') && g.endsWith(']')) || g.startsWith('{') || g.startsWith('"[') || g.startsWith("['")) {
    try {
      const parsed = JSON.parse(g);
      if (Array.isArray(parsed)) return parsed.map(x => String(x).trim()).join(', ');
      if (typeof parsed === 'string') return parsed.trim();
      // fallback stringify
      return String(parsed).trim();
    } catch (e) {
      // fallthrough to cleaning
    }
  }

  // remove surrounding brackets and quotes and extra whitespace
  let cleaned = g.replace(/[\[\]"]+/g, '').replace(/\'+/g, '').trim();

  // If looks like an array representation with commas inside quotes, remove stray quotes
  cleaned = cleaned.replace(/\"/g, '');

  // If cleaned is like "aaa, bbb" keep as is; if it's a JSON-like single-item string with extra punctuation, tidy it
  return cleaned;
}

console.log('Normalizing vinis.genero...');
let changed = 0;
let total = 0;

db.serialize(() => {
  db.all('SELECT id, genero FROM vinis', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar vinis:', err);
      process.exit(1);
    }

    total = rows.length;
    if (total === 0) {
      console.log('Nenhum vinil encontrado. Nada a normalizar.');
      process.exit(0);
    }

    let updates = 0;
    rows.forEach((r) => {
      const before = r.genero;
      const after = normalizeGenero(before);
      if ((before || '') !== (after || '')) {
        db.run('UPDATE vinis SET genero = ? WHERE id = ?', [after, r.id], function (uerr) {
          if (uerr) console.error('Erro ao atualizar vinil id', r.id, uerr);
          else {
            changed++;
            // console.log(`Updated id=${r.id} : "${before}" -> "${after}"`);
          }
          updates++;
          if (updates === total) {
            console.log(`Normalized ${changed} / ${total} vinis.genero`);
            process.exit(0);
          }
        });
      } else {
        updates++;
        if (updates === total) {
          console.log(`Normalized ${changed} / ${total} vinis.genero`);
          process.exit(0);
        }
      }
    });
  });
});
