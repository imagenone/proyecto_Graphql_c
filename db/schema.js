const { gql } = require("graphql-tag");


// Schema
const typeDefs = gql`
  type Curso {
    titulo: String
  
  }
  type Tecnologia {
    titulo: String
    tecnologia: String
  }

input CursoInput {
    tecnologia: String
}

  type Query {
    obtenerCursos(input: CursoInput!) :[Curso]
    obtenerTecnologia: [Tecnologia]
  }
`;


module.exports = typeDefs
