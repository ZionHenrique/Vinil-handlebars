const express = require('express');
const exphbs = require('express-handlebars');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs.engine({ defaultLayout: false }));

app.set('view engine', 'handlebars');

let vinis = [
    {id: 1, nome: 'Chromakopia', artista: 'Tyler, the Creator', preco: 536728.5678, ano: 2024, genero: ["rap"], quant: 456789},
    {id: 2, nome: "Breach", artista:" Twenty one pilots", preco:11111.111, ano: 2025, genero: ["descubra", "rock alt", 'pop rock'], quant: 6969696},
    {id: 3, nome: "To Pimp a butterfly", artista: "Kendrick Lamar", preco: 696696969.69, ano: 2015, genero: ["rap"], quant: 999999999}
]

app.get('/', (rep, res)=> res.render('home'));

app.get('/vinis', (req,res) => {
    res.render('listaVinis', {vinis})
})

app.get('/vinis/add', (req,res) => {
    res.render('addVinis', {vinis})
})







app.listen(port, () => {
    console.log(`Servidor em execução: http://localhost:${port}`);
})