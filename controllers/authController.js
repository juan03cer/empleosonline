const passport = require("passport");
const mongoose = require('mongoose');
const { body } = require("express-validator");
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios')
const crypto = require('crypto')
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate('local',{
        successRedirect: '/administracion',
        failureRedirect: '/iniciar-sesion',
        failureFlash: true ,
})

//Revisar si el usuario esta auntenticado o no 
exports.verificarUsuario = (req,res,next) =>{
        //revisar si el usuario esta autenticado 
        if(req.isAuthenticated()){
                return next();
        }
        // direccionarlos
        res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async(req,res) =>{

        //consultar el usuario autenticado
        const vacantes = await Vacante.find({ autor:req.user._id}).lean();

        res.render('administracion',{
                nombrePagina:'Panel de Administracion',
                tagline:'Crea y Administra tus vacantes desde aqui',
                cerrarSesion: true,
                nombre:req.user.nombre,
                imagen: req.user.imagen,
                vacantes
        })
}

exports.cerrarSesion = (req, res, next) => {
        req.logout(function(err) {
            if (err) {
                return next(err);
            }
            req.flash('correcto', 'Cerraste sesión correctamente');
            res.redirect('/iniciar-sesion');
        });
    };
    
exports.formReestablecerPassword = (req,res) =>{
         res.render('reestablecer-password',{
                nombrePagina:'Reestablece tu Contraseña',
                tagline: 'Si no recuerdas tu contraseña ,coloca tu correo para enviar las indicaciones para reestablecer tu contraseña'
         })
}
//generar el token en la tabla del usuario
exports.enviarToken = async (req,res) =>{
        const usuario = await Usuarios.findOne({email: req.body.email});
        if(!usuario){
                req.flash('error', 'No existe esa cuenta');
                req.redirect('/iniciar-sesion')
        }

        //el usuario existe, general token
        usuario.token = crypto.randomBytes(20).toString('hex');
        usuario.expira = Date.now() + 3600000;

        //Guardar el usuario
        await usuario.save();
        const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;


        //todo : enviar notificacion por email
        await enviarEmail.enviar({
                usuario,
                subject : 'Reestablecer Password',
                resetUrl,
                archivo:'reset'
        })

        //todo correcto
        req.flash('correcto', 'Revisa tu bandeja de correos para ver las indicaciones')
        res.redirect('/iniciar-sesion')

}

//Validar si el token es valido y el usuario existe muestra la vista

exports.reestablecerPassword = async(req,res)=>{
        const usuario = await Usuarios.findOne({
                token:req.params.token,
                expira:{
                        $gt : Date.now()
                }
        })

        if(!usuario){
                req.flash('error', 'El formulario ya no es valido, intenta de nuevo ');
                return res.redirect('/reestablecer-password');
        }
        //todo bien ,mostrar el formulario
        res.render('nuevo-password',{
                nombrePagina : 'Nueva Contraseña'
        })

}

//almacenar nueva contraseña en la base de datos

exports.guardarPassword = async (req,res)=>{
        const usuario = await Usuarios.findOne({
                token:req.params.token,
                expira:{
                        $gt : Date.now()
                }
        });

        //No existe el usuario o el token es invalido
        if(!usuario){
                req.flash('error', 'El formulario ya no es valido, intenta de nuevo ');
                return res.redirect('/reestablecer-password');
        }
        //Asignar nuevo password y limpiar valores previos
        usuario.password= req.body.password;
        usuario.token= undefined;
        usuario.expira=undefined;

        //agregar y eliminar valores del objeto
        await usuario.save();
        req.flash('correcto', 'Contraseña actualizada correctamente')
        res.redirect('/iniciar-sesion');
}