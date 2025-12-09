const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/vinil.db');
const sql = `SELECT m.*, a.id AS artistaId, a.nome AS artistaNome FROM musicas m LEFT JOIN artistas a ON a.id = m.artistaId ORDER BY m.id DESC`;
console.log('Running SQL:', sql);
db.all(sql, [], (err, rows) => {
  if (err) {
    console.error('SQL ERROR:', err);
  } else {
    console.log('OK, rows:', rows.length);
  }
  db.close();
});
