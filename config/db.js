const mongoose = require('mongoose');
require('dotenv').config({path:'variables.env'});

const conectarDB = async () =>{
try {
    await mongoose.connect(process.env.DB_MONGO,{
            useNewUrlParser : true,
            useUnifiedTopoLogy:true,
          });
    console.log("DB connection established")
} catch (error) {
    console.log('hubo un error: ' + error)
    console.log('hubo un error: ')

    process.exit(1); // detener la aplicación
}
}

module.exports = conectarDB;