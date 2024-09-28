const mongoose = require("mongoose")
const Vacante = mongoose.model('Vacante')
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { cerrarSesion } = require("./authController");

exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante',{
        nombrePagina: 'Nuevo Trabajo',
        tagline:'Llena el formulario y publica tu Empleo',
        cerrarSesion:true,
        nombre:req.user.nombre,
        imagen: req.user.imagen
    })
}


exports.agregarVacante = async (req,res) =>{
     const vacante = new Vacante(req.body);

     //Usuario autor de la vacante
     vacante.autor = req.user._id;

     //crear arreglo de habilidades (skills)
     vacante.skills = req.body.skills.split(',')

        //almacenarlo en la base de datos
        const nuevaVacante = await vacante.save()

        res.redirect(`/vacantes/${nuevaVacante.url}`);
    }
    
exports.mostrarVacante = async (req,res,next) =>{
     const vacante = await Vacante.findOne({ url: req.params.url}).lean().populate('autor');

     //si no hay resultados 
     if(!vacante) return next();
     res.render('vacante',{
        vacante,
        nombrePagina: `${vacante.titulo}`,
        barra:true

     })
}

exports.formEditarVacante = async (req,res,next) =>{

    const vacante = await Vacante.findOne({ url:req.params.url}).lean();

    if(!vacante) return next();

    res.render('editar-vacante',{
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion:true,
        nombre:req.user.nombre,
        imagen: req.user.imagen


    })
}

exports.editarVacante = async (req,res)=>{

    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url},
         vacanteActualizada,{
            new:true,
            runValidators:true,

    })

    res.redirect(`/vacantes/${vacante.url}`)
}

//validar y Sanitizar los campos de las nuevas vacantes

exports.validarVacante = [
    body('titulo').notEmpty().withMessage('Agrega un Titulo a la Vacante'),
    body('empresa').notEmpty().withMessage('Agrega una Empresa'),
    body('ubicacion').notEmpty().withMessage('Agrega una Ubicacion'),
    body('contrato').notEmpty().withMessage('Selecciona el Tipo de Contrato'),
    body('skills').notEmpty().withMessage('Agrega al menos una habilidad'),

    (req, res, next) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            req.flash('error', errores.array().map(error => error.msg));
            return res.render('nueva-vacante', {
                nombrePagina: 'Nueva Vacante',
                tagline: 'LLena el Formulario y Publica tu Vacante',
                cerrarSesion:true,
                mensajes: req.flash(),
                datos: req.body  
            });
        }
        next();
    }
];

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);
    if (vacante && verificarAutor(vacante, req.user)) {
        await Vacante.deleteOne({ _id: id }); 
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        res.status(403).send('Error: No tienes permiso para eliminar esta vacante');
    }
};


const verificarAutor = (vacante = {},usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
        return false
    }
    return true;
}

//Subir archivos en pdf
exports.subirCV =  (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb ');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            return next();
        }
    });
}

const configuracionMulter = {
    limits : { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        }, 
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf') {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}
const upload = multer(configuracionMulter).single('cv');

exports.contactar = async(req,res,next) =>{

    const vacante = await Vacante.findOne({url: req.params.url})

    //si no existe la vacante 
    if(!vacante) return next();

    //todo bien ,construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }
    //almacenar la vacante
    vacante.candidatos.push(nuevoCandidato)
    await vacante.save();
    
    //mensaje flash y redireccion
    req.flash('correcto', 'Se envio tu Curriculum Correctamente')
    res.redirect('/')
}

exports.mostrarCandidatos = async (req,res) =>{

    const vacante = await Vacante.findById(req.params.id).lean()

    if(vacante.autor === req.user._id.toString()){
        return next();
    }

    if(!vacante) return next();

    res.render('candidatos',{
        nombrePagina:`Candidatos Sobre el Empleo de: - ${vacante.titulo}`,
        cerrarSesion:true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos:vacante.candidatos 
    })

}
//buscador de vacantes
exports.buscarVacantes = async (req,res) =>{
    const vacantes = await Vacante.find({
        $text : {
            $search : req.body.q
        }
    }).lean();
    //mostrar las vacantes
    res.render('home',{
        nombrePagina:`Resultados para la busqueda: ${req.body.q}`,
        barra:true,
        vacantes
    })
}