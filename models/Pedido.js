const mongoose = require('mongoose');

const ProductoSchema = mongoose.Schema({

   pedido : {
    type: Array,
    required: true
   },
   total: {
    type: Number,
    required: true
   },
   cliente :{
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'cliente',
   },
   Vendedor :{
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Usuario',
   },
   estado: {
    type: String,
    default: "PENDIENTE"
   },
   creado:{
    type: Date, //
    default: Date.now(),
},


    
});

module.exports = mongoose.model('Pedido', ProductoSchema );