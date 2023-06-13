const { ApolloServer } = require("@apollo/server");

const { startStandaloneServer } = require("@apollo/server/standalone");
const typeDefs = require("./db/schema.js"); //schema
const resolvers = require("./db/resolvers.js"); //resolvers
const jwt = require("jsonwebtoken"); //autenticar usuario
require("dotenv").config({ path: "variables.env" });

const conectarDB = require("./config/db.js"); // conectar a la DB



//llamar funcion de la base de datos
conectarDB();












//servidor
const server = new ApolloServer({  resolvers,  typeDefs,})

//arrancar el servidor puerto 4000
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => {
// console.log("ctx: " + req.headers.authorization || '')
const token = req.headers.authorization || '' // si no existe le pasa un string vacio ''
if (token) {
  try {
    const usuario =  jwt.verify(token, process.env.SECRETA);
  //  console.log("usuario: " , usuario)
  return{ 
    usuario
  }

  } catch (error) {
    console.log(error)
    console.log("Hubo un error")
  }
  
}

    } ,
    listen: { port: 4000 },
    
  });
 
  console.log(`🚀  Server ready at ${url}`);

}

startServer().catch((error) => {
  //mensaje si hay error al conectar 
  console.error("Error starting server:", error)
})










// async function startServer() {
//   servidor
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: ({ req }) => {
//       
//       const token = req.headers.authorization || '';
//    console.log("req: ", token)
//     return { token}
    
//     },
//   });
//   arrancar el servidor

//   const { url } = await startStandaloneServer(server, {
//     listen: { port: 4000 },
//   });

//   console.log(`Servidor listo en la URL: ${url}`);
// }

// startServer().catch((error) => {
//   console.error("Error starting the server:", error);
// });
