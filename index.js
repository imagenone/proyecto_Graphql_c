const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require('@apollo/server/standalone');
// const { gql } = require("graphql-tag");
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')





async function startServer() {
  //servidor
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
//arrancar el servidor
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at: ${url}`);
}


startServer().catch((error) => {
  console.error("Error starting the server:", error);
});



















