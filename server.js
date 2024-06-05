const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User');
const Fichaje = require('./models/Fichaje');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', 'views');

mongoose.connect('mongodb://localhost:27017/fichaje')
    .then(() => {
        console.log("Conexion a la base de datos realizada");
    })
    .catch(error => {
        console.error('Error al conectarse a la base de datos', error);
    });

app.get("/", async (req, res) => {
    const fichajes = await Fichaje.find({ date: { $gte: today() } });
    res.render('index', { error: null, fichajes });
})

app.get("/validate", (req, res) => {
    res.redirect('/');
})

app.post('/validate', async (req, res) => {
    const { dni, password } = req.body;

    const user = await User.findOne({ dni });

    if (!user) {
        res.render('error', { error: "DNI no existente" })
        return
    }
    if (user.password != password) {
        res.render('error', { error: "Contraseña incorrecta" })
        return
    }

    const fichajes = await Fichaje.find({ dni });
    let status = "entrada";
    let cont = 0;

    fichajes.forEach(fichaje => {
        if (fichaje.date.split(' ')[0] == now().split(' ')[0]) {
            status = "salida";
            cont++;
        }
    })

    if (cont > 1) {
        res.render('error', { error: 'Ya fichaste salida hoy, vuelve mañana.' });
        return
    }

    res.render('fichaje', { dni, username: user.username, status });
})

app.post('/fichaje', async (req, res) => {
    const { username, dni } = req.body;
    const fichajes = await Fichaje.find({ date: { $gte: today() } });
    if(fichajes.length == 0){
        Fichaje.create({ username, dni, date: now(), status: 'Entrada' })
        res.redirect('/');
    } else {
        Fichaje.create({ username, dni, date: now(), status: 'Salida' })
        res.redirect('/');
    }
})

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

function now(){
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return(day + '/' + month + '/' + year + '  ' + hours + ':' + minutes + ':' + seconds);
}

function today(){
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = '0';
    const minutes = '0';
    const seconds = '0';
    return(day + '/' + month + '/' + year + '  ' + hours + ':' + minutes + ':' + seconds);
}