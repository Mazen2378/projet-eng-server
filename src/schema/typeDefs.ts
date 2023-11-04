
export const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  type Question {
    id: Int
    prompt: String
    options: [String]
    answers: [Answer]
  }
  type Answer {
    id: Int
    content: String
    age: Int
    sex: String
    location: String
  }
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    answers(questionId: Int!): [Answer]
    questions: [Question]
    question(questionId:Int!): Question
  }
  type Mutation {
    submitAnswer(questionId: Int!, content:String,age:Int,sex:String,location:String): Answer
  }
  type Subscription {
    answers(questionId: Int!): [Answer]
  }
`;

