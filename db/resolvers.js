const Usuario = require('../models/usuarios')
  
  // Resolvers
  const resolvers = {
    Query: {
      obtenerCurso: () => 'hola'
    
    },
    Mutation:{
      nuevoUsuario:async (_,{input}) => {
        const {email, password} = input;
      //revisar si el usuario esta registrado
        const existeUsuario = await Usuario.findOne({email});
          if (existeUsuario) {
            throw Error('Usuario ya existe')
            
          }
      //hasheaer su password


      //guardar en la base de datos
      try {
        const usuario = new Usuario(input);
        usuario.save(); // guardar en la base de datos
        return usuario;
      } catch (error) {
        console.log(error)
      }


      }
    }
  };

module.exports = resolvers;