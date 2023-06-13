const mongoose = require('mongoose');

const ProductosSchema = mongoose.Schema({

    nombre:{
        type: 'String',
        required: true, //de tipo obligatorio
        trim: true, //sirve para eliminar los espacion entre los caracteres
    },
    existencia:{
        type: Number, //
        required: true, //
        trim: true, //sirve para eliminar los espacion entre los caracteres

    },
    precio:{
        type: Number, //
        required: true, //
        trim: true, //sirve para eliminar los espacion entre los caracteres

    },
    creado:{
        type: Number, //
        default: Date.now(),
    }

});

module.exports = mongoose.model('Producto', ProductosSchema );