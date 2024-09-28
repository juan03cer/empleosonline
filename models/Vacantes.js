const mongoose = require ('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug')
const shortid = require('shortid'); 

const vacantesShema = new mongoose.Schema({
    titulo:{
        type:String,
        require:' El nombre de la vante es obligatorio',
        trim:true// si exiten espacion al inicio al final no afecten
    },
    empresa:{
        type:String,
        trim:true
    },
    ubicacion:{
        type:String,
        trim:true,
        require:'La ubicacion es obligatoria'
    },
    salario:{
        type:String,
        default:0
    },
    contrato:{
        type:String,
        trim:true
    },
    descripcion:{
        type:String,
        trim:true
    },
    url:{
        type:String,
        lowercase:true //sirve para hacerlo minusculas
    },
    skills:[String],
    candidatos:[{
        nombre:String,
        email:String,
        cv:String
    }],
    autor:{
        type: mongoose.Schema.Types.ObjectId, 
        ref:'Usuarios',
        required: 'El autor es obligatorio'
    }
    
});

vacantesShema.pre('save', function(next){
    //crear la url 
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;

    next();
})

//Crear un indice
vacantesShema.index({titulo: 'text'})

module.exports = mongoose.model('Vacante', vacantesShema);