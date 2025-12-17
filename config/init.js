// config/init.js
const db = require("./database");

db.serialize(() => {
  // Tabela perfis
  db.run(`CREATE TABLE IF NOT EXISTS perfis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    endereco TEXT
  )`);

  // Tabela generos
  db.run(`CREATE TABLE IF NOT EXISTS generos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT
  )`);

  // Tabela vinis
  db.run(`CREATE TABLE IF NOT EXISTS vinis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    artista TEXT,
    preco REAL,
    quant INTEGER,
    genero TEXT,
    ano INTEGER
  )`);

  // Tabela artistas
  db.run(`CREATE TABLE IF NOT EXISTS artistas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    pais TEXT,
    ano_inicio INTEGER,
    biografia TEXT
  )`);

  // Tabela musicas
  db.run(`CREATE TABLE IF NOT EXISTS musicas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    duracao TEXT,
    artista TEXT,
    artistaId INTEGER,
    FOREIGN KEY (artistaId) REFERENCES artistas(id)
  )`);

  // Tabela distribuidoras (nova)
  db.run(`CREATE TABLE IF NOT EXISTS distribuidoras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    pais TEXT,
    contato TEXT,
    descricao TEXT
  )`);

  // Tabela compras
  db.run(`CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clienteId INTEGER,
    vinilId INTEGER,
    quantidade INTEGER,
    total REAL,
    data TEXT,
    FOREIGN KEY (clienteId) REFERENCES perfis(id),
    FOREIGN KEY (vinilId) REFERENCES vinis(id)
  )`);

  // Inserir dados iniciais (mantidos)
  db.get("SELECT COUNT(*) AS count FROM perfis", (err, row) => {
    if (!err && row.count === 0) {
      db.run(`INSERT INTO perfis (nome,email,telefone,endereco) VALUES 
        ('João Silva','joao@email.com','(11) 99999-9999','Rua A, 123'),
        ('Maria Santos','maria@email.com','(11) 88888-8888','Rua B, 456')`);
    }
  });

  db.get("SELECT COUNT(*) AS count FROM generos", (err, row) => {
    if (!err && row.count === 0) {
      db.run(`INSERT INTO generos (nome,descricao) VALUES
        ('Rap','Hip-hop e rap'),
        ('Rock','Rock alternativo e pop rock'),
        ('Pop','Música popular')`);
    }
  });

  db.get("SELECT COUNT(*) AS count FROM vinis", (err, row) => {
    if (!err && row.count === 0) {
      db.run(`INSERT INTO vinis (nome,artista,preco,quant,genero,ano) VALUES
        ('Chromakopia','Tyler, the Creator',536728.57,456789,'Rap',2024),
        ('Breach','Twenty one pilots',11111.11,6969696,'Rock, Pop',2025),
        ('To Pimp a butterfly','Kendrick Lamar',696696969.69,999999999,'Rap',2015)`);
    }
  });
});

console.log("Tabelas criadas e dados iniciais inseridos (se ainda não existiam).");