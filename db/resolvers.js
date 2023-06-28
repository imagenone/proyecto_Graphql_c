const Usuario = require("../models/usuarios");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedido");

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
    obtenerUsuario: async (_, {}, ctx) => {
      return ctx.usuario
      // try {
      //   const usuarioId = await jwt.verify(token, process.env.SECRETA); //la misma que verifique el token
      //   return usuarioId;
      // } catch (error) {
      //   console.log("token invalido",error);
      //   throw new Error("Token inválido o expirado");
      // }
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
        const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
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

    },
    obtenerPedidos : async () => {
      try {
        const pedidos = await Pedido.find({});
        console.log("obtenerPedidos:", pedidos)
        return pedidos;
    } catch (error) {
        console.log(error);
    }
    },
    obtenerPedidosVendedor : async (_,{},ctx) => {
      try {
        const pedidos = await Pedido.find({ vendedor: ctx.usuario.id });
        console.log("pedidos:", pedidos);
        return pedidos;
    } catch (error) {
        console.log(error);
      
    }
    },
    obtenerPedido : async (_,{id}, ctx) => {
   // Si el pedido existe o no
   const pedido = await Pedido.findById(id);
   if(!pedido) {
       throw new Error('Pedido no encontrado');
   }

   // Solo quien lo creo puede verlo
   if(pedido.vendedor.toString() !== ctx.usuario.id) { //si no exiaste el pedido
       throw new Error('No tienes las credenciales');
   }

   // retornar el resultado
   return pedido;
    },
    obtenerPedidosEstado: async (_, { estado }, ctx) => {
      const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });

      return pedidos;
  },
  mejoresClientes: async () => {
    const clientes = await Pedido.aggregate([
        { $match : { estado : "COMPLETADO" } }, // el pedido que quieres filtrar
        { $group : {
            _id : "$cliente", 
            total: { $sum: '$total' }
        }}, 
        {
            $lookup: {
                from: 'clientes', 
                localField: '_id',
                foreignField: "_id",
                as: "cliente"
            }
        }, 
        {
            $limit: 10
        }, 
        {
            $sort : { total : -1 } //cambia el total a mayor primero
        }
    ]);

    return clientes;
}, 
mejoresVendedores: async () => {
  const vendedores = await Pedido.aggregate([
      { $match : { estado : "COMPLETADO"} },
      { $group : {
          _id : "$vendedor", 
          total: {$sum: '$total'} // suma todos registro de un vendedor en especifico
      }},
      {
          $lookup: {
              from: 'usuarios', 
              localField: '_id',
              foreignField: '_id',
              as: 'vendedor'
          }
      }, 
      {
          $limit: 3
      }, 
      {
          $sort: { total : -1 }
      }
  ]);

  return vendedores;
},
buscarProducto: async(_, { texto }) => {
  const productos = await Producto.find({ $text: { $search: texto  } }).limit(10) // traer minimo 10 vistas

  return productos;
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
      
      console.log("cliente no!! Existe:", clienteExiste)

      // verificar si el cliente es del vendedor
      if(clienteExiste.vendedor.toString() !== ctx.usuario.id) {
       
        throw new Error('no tienes las Credenciales');
    }


      // Revisar si el stock este disponible
      for await ( const articulo of input.pedido ) {
        const { id } = articulo;

        const producto = await Producto.findById(id);
        console.log("producto", producto)

        if(articulo.cantidad > producto.existencia) {
            throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
        } else {
          // Restar la cantidad a lo disponible
          producto.existencia = producto.existencia - articulo.cantidad;

          await producto.save();
      }
    }

     // Crear un nuevo pedido
     const nuevoPedido = new Pedido(input);
    console.log("nuevoPedido:", nuevoPedido)
        // asignarle un vendedor
       const vendedor = ctx.usuario.id 
       console.log("vendedor!!!",vendedor)
       nuevoPedido.vendedor = ctx.usuario.id ;
      

      console.log("vendedor asignado:", nuevoPedido.vendedor);

        
        // Guardarlo en la base de datos
        const resultado = await nuevoPedido.save();
        return resultado;

    },
    actualizarPedido: async(_, {id, input}, ctx) => {

      const { cliente } = input;

      // Si el pedido existe
      const existePedido = await Pedido.findById(id);
      if(!existePedido) {
          throw new Error('El pedido no existe');
      }

      // Si el cliente existe
      const existeCliente = await Cliente.findById(cliente);
      if(!existeCliente) {
          throw new Error('El Cliente no existe');
      }

      // Si el cliente y pedido pertenece al vendedor
      if(existeCliente.vendedor.toString() !== ctx.usuario.id ) {
          throw new Error('No tienes las credenciales');
      }

      // Revisar el stock
      if( input.pedido ) {
          for await ( const articulo of input.pedido ) {
              const { id } = articulo;

              const producto = await Producto.findById(id);

              if(articulo.cantidad > producto.existencia) {
                  throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
              } else {
                  // Restar la cantidad a lo disponible
                  producto.existencia = producto.existencia - articulo.cantidad;

                  await producto.save();
              }
          }
      }



      // Guardar el pedido
      const resultado = await Pedido.findOneAndUpdate({_id: id}, input, { new: true });
      return resultado;

  },
  eliminarPedido: async (_, {id}, ctx) => {
      // Verificar si el pedido existe o no
      const pedido = await Pedido.findById(id);
      if(!pedido) { //si no existe el pedido
          throw new Error('El pedido no existe')
      }

      // verificar si el vendedor es quien lo borra
      if(pedido.vendedor.toString() !== ctx.usuario.id ) {
          throw new Error('No tienes las credenciales')
      }

      // eliminar de la base de datos
      await Pedido.findOneAndDelete({_id: id});
      return "Pedido Eliminado"
  }
  },
};

module.exports = resolvers;
