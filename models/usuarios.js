const mongoose = require('mongoose');

const UsuariosShema = mongoose.Schema({

    nombre:{
        type: 'String',
        required: true, //de tipo obligatorio
        trim: true, //sirve para eliminar los espacion entre los caracteres
    },

    apellido:{
        type: 'String',
        required: true, //de tipo obligatorio
        trim: true, //sirve para eliminar los espacion entre los caracteres

    },
    email:{
        type: 'String',
        required: true, //de tipo obligatorio
        trim: true, //sirve para eliminar los espacion entre los caracteres
        unique: true, //
    },
    password:{
        type: 'String',
        required: true, //de tipo obligatorio
        trim: true, //sirve para eliminar los espacion entre los caracteres

    },
    creado:{
        type:Date,
        default:Date.now()

    }



});

module.exports = mongoose.model('Usuarios', UsuariosShema);