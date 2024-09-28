const mongoose = require('mongoose');
mongoose.Promise = global.Promise
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        lowercase:true ,//convertir a minusculas cuando se almacene
        trim:true // si exiten espacion al inicio al final no afecten
    },
    nombre:{
        type:String,
        required:'Agrega tu Nombre'

    },
    password:{
        type:String,
        required:true,
        trim:true

    },
    token:String,
    expira:Date,
    imagen:String
});

// Metodo para hashear las contraseñas
usuariosSchema.pre('save',async function(next){
    //si la contaseña ya esta hasheada 
    if(!this.isModified('password')){
        return next();//deten la ejecucion
    }
    //si no esta hasheado
    const hash = await bcrypt.hash(this.password,12);
    this.password = hash;
    next();
})
//enviar alerta cuando el usuario ya esta registrado
usuariosSchema.post('save', function(error,doc,next){
    if(error.name === 'MongoError' && error.code === 11000)  {
       next('EL correo ya esta Registrado')   
    } else {
        next(error);
    }
      
})

//autenticar a los usuarios
usuariosSchema.methods={
    compararPassword:function(password){
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema);