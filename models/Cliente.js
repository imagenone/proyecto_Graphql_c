const mongoose = require('mongoose');

const ClientesSchema = mongoose.Schema({

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
    empresa:{
        type: 'String',
        required: true, //de tipo obligatorio
        trim: true, //sirve para eliminar los espacion entre los caracteres
    },
    email:{
        type: 'String',
        required: true, //de tipo obligatorio
        trim: true, //sirve para eliminar los espacion entre los caracteres
        unique: true, //de tipo obligatorio
    },
    telefono:{
        type: 'String',
        trim: true, //sirve para eliminar los espacion entre los caracteres
    },
    creado:{
        type: Number, //
        default: Date.now(),
    },
    vendedor:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Usuario"
    }

});

module.exports = mongoose.model('Cliente', ClientesSchema );