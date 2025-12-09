const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "database", "vinil.db");

// Garantir singleton da conexão (útil em hot-reload / múltiplos requires)
if (!global.__vinil_db) {
    global.__vinil_db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error(err.message);
        else console.log("Banco carregado:", dbPath);
    });
}

module.exports = global.__vinil_db;
