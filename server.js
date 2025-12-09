const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");

// Inicializar app
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Handlebars
const hbs = exphbs.create({
    defaultLayout: false,
    helpers: {
        eq: (a, b) => a === b,
        contains: (arr, val) => Array.isArray(arr) && arr.includes(val),
    }
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Inicializar banco e tabelas
require("./config/init");

// Rotas
app.use("/perfis", require("./routes/perfisRoutes"));
app.use("/vinis", require("./routes/vinisRoutes"));
app.use("/generos", require("./routes/generosRoutes"));
app.use("/artistas", require("./routes/artistasRoutes"));
app.use("/musicas", require("./routes/musicasRoutes"));
app.use("/compras", require("./routes/comprasRoutes"));
app.use("/distribuidoras", require("./routes/distribuidorasRoutes"));

// Home
app.get("/", (req, res) => res.render("home"));

// Iniciar servidor
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
