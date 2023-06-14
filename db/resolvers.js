const Usuario = require("../models/usuarios");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken"); //autenticar usuario
require("dotenv").config({ path: "variables.env" });

const crearToken = (usuario, secreta, expiresIn) => {
  console.log(usuario);
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn }); // la misma que firma el token
};
//** Resolvers */ 
const resolvers = {
  Query: {
    obtenerUsuario: async (_, { token }) => {
      try {
        const usuarioId = await jwt.verify(token, process.env.SECRETA); //la misma que verifique el token
        return usuarioId;
      } catch (error) {
        console.log("token invalido");
        throw new Error("Token inválido o expirado");
      }
    },
    //obtener los Products
    obtenerProductos: async () => {
      try {
        const producto = await Producto.find({});
        return producto;
      } catch (error) {
        console.log(error);
      }
    },
    //obteber Producto
    obtenerProducto: async (_, { id }) => {
      //revisar si el producto existe
      const producto = await Producto.findById(id);
      console.log("obtener producto", Producto);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      return producto;
    },
    //obtener Clientes
    obtenerClientes : async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error)
        
      }
    },
    obtenerClientesVendedor : async (_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({vendedor: ctx.usuario.id.toString()});
        return clientes;
      } catch (error) {
        console.log(error)
        
      }
    },
    obtenerCliente : async (_, {id}, ctx) => {
      // revisar si el cliente existe
      const cliente = await Cliente.findById(id);
      if (!cliente){
        throw new Error('cliente not found');
      }

      // quien lo creo puede verlo
      if (cliente.vendedor.toString() !== ctx.usuario.id){ // si es difente a ctx.usuario.id
        throw new Error('dont have credentials');


      }

      return cliente;

    }
  },
  //**Mutation */
  Mutation: {
    // Nuevo Usuario
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;
      //revisar si el usuario esta registrado
      const existeUsuario = await Usuario.findOne({ email });
      if (existeUsuario) {
        throw Error("Usuario ya existe");
      }
      //hashear su password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);
      // input.password = await bcryptjs.hash(password, salt);

      //guardar en la base de datos
      try {
        const usuario = new Usuario(input);
        usuario.save(); // guardar en la base de datos
        return usuario;
      } catch (error) {
        console.log(error);
      }
    },
    //autenticar usuario
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;
      // si el usuario esta registrado
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw Error(" Email incorrecto");
      }

      //revisar si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );
      if (!passwordCorrecto) {
        throw Error("Password incorrecto");
      }

      // crear el toKen
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, "24h"),
      };
    },
    //nuevo Producto
    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);

        //almacenar en la DB
        const resultado = await producto.save();
        return resultado;
      } catch (error) {
        console.log(object);
        throw Error("error al ingresar productos");
      }
    },
    //actualizar producto
    actualizarProducto: async (_, { id, input }) => {
      //revisar si el producto existe o no
      let producto = await Producto.findById(id);

      console.log("Actualizar Producto", producto);
      if (!producto) {
        //si el producto no exisate
        throw new Error("Producto no encontrado");
      }
      // si existe guardarlo en la DB
      producto = await Producto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      }); //findOneAndUpdate lo va actualizar

      return producto;
    },
    eliminarProducto: async (_, { id }) => {
      //revisar si el producto existe o no
      let producto = await Producto.findById(id);

      console.log("Actualizar Producto", producto);
      if (!producto) {
        //si el producto no exisate
        throw new Error("Producto no encontrado");
      }
      // eliminar
      await Producto.findOneAndDelete({ _id: id });
      return "Producto eliminado";
    },

    //nuevo cliente
    nuevoCliente: async (_, { input }, ctx) => {
      const token = ctx;
      //
      console.log("token!!!:",token)
     
   
      const { email } = input;
       //verificar si el cliente ya esta registrado
      const cliente = await Cliente.findOne({ email });
  
      if (cliente) {
        throw new Error("cliente ya esta registrado");
      }
      const nuevoCliente = new Cliente(input);  
      //asignar el vendedor
       nuevoCliente.vendedor = ctx.usuario.id ;        
  
      //guardar en la DB
      try {
        const resultado = await nuevoCliente.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente : async (_,{id, input}, ctx) =>  {
      //verificar si existe
      let cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("cliente no existe");
      }
      // verificar si el vendedor es quine edita
      if (cliente.vendedor.toString() !== ctx.usuario.id){ // si es difente a ctx.usuario.id
        throw new Error('dont have credentials');
      }


      // guardar el cliente

      cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true})
      return cliente;
    },
    eliminarCliente: async (_,{id}, ctx) => {
        //verificar si existe
        let cliente = await Cliente.findById(id);

        if (!cliente) {
          throw new Error("cliente no existe");
        }
        // verificar si el vendedor es quine edita
        if (cliente.vendedor.toString() !== ctx.usuario.id){ // si es difente a ctx.usuario.id
          throw new Error('dont have credentials');
        }

        //elimnin el cliente
        await Cliente.findOneAndDelete({_id: id});
        return "cliente Eliminado";

    },
    nuevoPedido : async (_,{input}, ctx) => {
      const { cliente } = input
      // verfificar si el cliente existe
      let clienteExiste = await Cliente.findById(cliente);
      // verificar si el cliente es del vendedor

      if(!clienteExiste) {
        throw new Error('Ese cliente no existe');
    }


      // Revisar si el stock este disponible

      //asignar el vendedor

      // guardarlo en la base de datos

    }
  },
};

module.exports = resolvers;
