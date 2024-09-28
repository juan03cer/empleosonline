const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');


exports.mostrarTrabajos = async (req,res, next) =>{
    const vacantes = await Vacante.find().lean(); //lean convierte los documentos a objetos planos

    if(!vacantes) return next();
    res.render('home',{
        nombrePagina:'Plataforma de trabajos',
        tagline:'Encuentra y publica un trabajo para Desarrolladores ',
        barra:true,
        boton:true,
        vacantes
    })
}


