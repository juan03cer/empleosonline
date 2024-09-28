const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid')


exports.subirImagen = (req, res, next) => {
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
            res.redirect('/administracion');
            return;
        } else {
            return next();
        }
    });
}
// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles');
        }, 
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = async (req,res) =>{
    res.render('crear-cuenta',{
        nombrePagina:'Crea tu Cuenta en Empleos Online',
        tagline:'Comienza a publicar tus Curso gratis, solo debes crear una cuenta'
    })
}

exports.validarRegistro = [
    body('nombre').escape().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('El Correo no es válido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    body('confirmar').notEmpty().withMessage('Confirmar la contraseña es obligatorio'),
    body('confirmar').custom((value, { req }) => value === req.body.password)
      .withMessage('Las contraseñas no coinciden'),
  
    (req, res, next) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            req.flash('error', errores.array().map(error => error.msg));

            return res.render('crear-cuenta', {
                nombrePagina: 'Crea tu Cuenta en Trabajo Online ',
                tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
                mensajes: req.flash(),
                datos: req.body  
            });
        }
        next();
    }
];

exports.crearUsuario = async (req, res, next) => {
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        if (error.code === 11000) { // Error de clave duplicada
            req.flash('error', 'El correo ya está registrado');
        } else {
            req.flash('error', error.message); // Otros posibles errores
        }
        res.redirect('/crear-cuenta');
    }
};

exports.formIniciarSesion = (req,res) =>{
     res.render('iniciar-sesion',{
        nombrePagina:'Iniciar Sesion en Empleos Online'
     })
}

//form editar el perfil
exports.formeditarPerfil = (req, res) => {
    const usuario = JSON.parse(JSON.stringify(req.user)); // Convertir a un objeto plano
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu Perfil en trabajos Online',
        usuario,
        cerrarSesion: true,
        nombre:req.user.nombre,
        imagen: req.user.imagen
    });
};


//guardar cambios editar perfil
exports.editarPerfil =  async (req,res) =>{
    const usuario = await Usuarios.findById(req.user._id);
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password) {
        usuario.password = req.body.password
    }

    if(req.file){
        usuario.imagen = req.file.filename;
    }

    await usuario.save();
    
    req.flash('correcto', 'Cambios Guardados Correctamente')

    res.redirect('/administracion')
}


// Sanitizar y validar formulario de editar Clientes

exports.validarPerfil= [
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacio'),
    body('email').notEmpty().withMessage('El correo no puede ir vacio'),


    (req, res, next) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            req.flash('error', errores.array().map(error => error.msg));
            return res.render('editar-perfil', {
                nombrePagina: 'Edita Tu Perfil en Trabajos Online',
                cerrarSesion:true,
                mensajes: req.flash(),
                datos: req.body  ,
                nombre:req.user.nombre
            });
        }
        next();
    }
];
