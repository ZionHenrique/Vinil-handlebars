const db = require('../config/database');

const samples = [
  { nome: 'Distribuidora A', pais: 'Brasil', contato: 'contato@distribuidoraa.com', descricao: 'Distribuidora focada em rock nacional' },
  { nome: 'Global Records', pais: 'EUA', contato: 'info@globalrecords.com', descricao: 'Distribuição internacional' },
  { nome: 'Indie Flow', pais: 'Brasil', contato: 'hello@indieflow.br', descricao: 'Indie e música alternativa' }
];

db.serialize(() => {
  db.get('SELECT COUNT(*) AS cnt FROM distribuidoras', [], (err, row) => {
    if (err) {
      console.error('Erro ao checar distribuidoras:', err);
      process.exit(1);
    }
    const cnt = row ? row.cnt : 0;
    if (cnt > 0) {
      console.log(`Distribuidoras já existem no banco (count=${cnt}). Nenhuma alteração feita.`);
      process.exit(0);
    }

    let inserted = 0;
    samples.forEach(s => {
      db.run('INSERT INTO distribuidoras (nome,pais,contato,descricao) VALUES (?,?,?,?)', [s.nome, s.pais, s.contato, s.descricao], function(err2) {
        if (err2) console.error('Erro ao inserir distribuidora', s.nome, err2);
        else {
          inserted++;
          console.log(`Inserted distribuidora id=${this.lastID} nome=${s.nome}`);
        }
        if (inserted === samples.length) {
          console.log(`Inserted ${inserted} distribuidoras.`);
          process.exit(0);
        }
      });
    });
  });
});
