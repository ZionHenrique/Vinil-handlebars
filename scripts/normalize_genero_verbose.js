const db = require('../config/database');

function normalizeGenero(g) {
  if (g === null || g === undefined) return null;
  if (typeof g !== 'string') return String(g);
  let original = g;
  g = g.trim();

  // try JSON parse when looks like array or JSON
  if ((g.startsWith('[') && g.endsWith(']')) || g.startsWith('{') || g.startsWith('"[') || g.startsWith("['")) {
    try {
      const parsed = JSON.parse(g);
      if (Array.isArray(parsed)) return parsed.map(x => String(x).trim()).join(', ');
      if (typeof parsed === 'string') return parsed.trim();
      return String(parsed).trim();
    } catch (e) {
      // fallthrough to cleaning
    }
  }

  // remove surrounding brackets and quotes and extra whitespace
  let cleaned = g.replace(/[\[\]"]+/g, '').replace(/\'+/g, '').trim();
  cleaned = cleaned.replace(/\"/g, '');
  return cleaned;
}

console.log('Listing current vinis (id, nome, genero):');

function listVinis(cb) {
  db.all('SELECT id,nome,genero FROM vinis', [], (err, rows) => {
    if (err) return cb(err);
    rows.forEach(r => console.log(`${r.id}\t${r.nome}\t"${r.genero}"`));
    cb(null, rows);
  });
}

listVinis((err, rows) => {
  if (err) {
    console.error('Erro ao listar vinis:', err);
    process.exit(1);
  }

  console.log('\nRunning normalization with detailed logs...');
  let total = rows.length;
  let processed = 0;
  let changed = 0;

  if (total === 0) {
    console.log('No vinis found.');
    process.exit(0);
  }

  rows.forEach(r => {
    const before = r.genero;
    const after = normalizeGenero(before);
    if ((before || '') !== (after || '')) {
      db.run('UPDATE vinis SET genero = ? WHERE id = ?', [after, r.id], function (uerr) {
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
    console.log(`\nDone. ${changed} updated, ${total - changed} unchanged (out of ${total}).`);
    console.log('\nListing vinis after normalization:');
    listVinis((err2) => {
      if (err2) console.error('Erro ao listar vinis apos:', err2);
      process.exit(0);
    });
  }
});
