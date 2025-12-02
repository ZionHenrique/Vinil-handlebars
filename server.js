const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const db = require('./config/database');

// Importar rotas
const vinisRoutes = require('./routes/vinisRoutes');
const perfisRoutes = require('./routes/perfisRoutes');
const generosRoutes = require('./routes/generosRoutes');
const artistasRoutes = require('./routes/artistasRoutes');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helpers do Handlebars
const hbs = exphbs.create({
    defaultLayout: false,
    helpers: {
        eq: function(a, b) {
            return a === b;
        },
        contains: function(array, value) {
            if (!array || !Array.isArray(array)) return false;
            return array.includes(value);
        }
    }
});

app.engine('handlebars', exphbs.engine({ defaultLayout: false }));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rota principal
app.get('/', (req, res) => res.render('home'));

// Usar rotas separadas
app.use('/vinis', vinisRoutes);
app.use('/perfis', perfisRoutes);
app.use('/generos', generosRoutes);
app.use('/artistas', artistasRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
