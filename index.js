const mongoose = require ('mongoose');
require('./config/db');
const express = require('express');
const exphbs = require('express-handlebars');
const path =  require ('path')
const router = require('./routes');
const cookieParser = require ('cookie-parser');
const session = require ('express-session')
const MongoStore = require ('connect-mongo')
const bodyParser= require('body-parser')
const expressValidator = require('express-validator');
const flash = require('connect-flash')
const createError =require('http-errors');
const passport =require('./config/passport');
const { console } = require('inspector');
const { port } = require('./config/email');

require('dotenv').config({ path: 'variables.env'});

const app= express();

//habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))


//habilitar handlebars como view
app.engine('handlebars',
    exphbs.engine({
        defaultLayout:'layout',
        helpers: require('./helpers/handlebars')
    })
);
app.set('view engine','handlebars');

//static files
app.use(express.static(path.join(__dirname,'public')));

app.use(cookieParser());

const mongoUrl = process.env.DATABASE; 

app.use(session({
    secret: process.env.SECRETO,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUrl
    })
}));

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//alertas
app.use(flash());

// //crear nuestro middleware
app.use((req,res,next) => {
      res.locals.mensajes = req.flash();
         next();
     })

app.use('/',router());

// 404 pagina no existente
app.use((req, res, next) => {
    next(createError(404, 'No Encontrado'));
})

// Administración de los errores
app.use((error, req, res,next) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

// dejar que heroku asigne el puerto
const host = '0.0.0.0';
const port = process.env.PORT || 3000; // Usa 3000 como puerto predeterminado

app.listen(port, host, () => {
    console.log(`El servidor está funcionando en el puerto ${port}`);
});

// app.listen(process.env.PUERTO); // para local
