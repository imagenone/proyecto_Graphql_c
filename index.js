const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const typeDefs = require("./db/schema.js");
const mainresolvers = require("./db/resolvers.js");

const conectarDB = require("./config/db.js") //archivo para conectar a la DB

//llamar funcion de la base de datos
conectarDB();

async function startServer() {
  //servidor
  const server = new ApolloServer({
    typeDefs,
    resolvers: mainresolvers,
   
  });
  //arrancar el servidor

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`Servidor listo en la URL: ${url}`);
}

startServer().catch((error) => {
  console.error("Error starting the server:", error);
});
