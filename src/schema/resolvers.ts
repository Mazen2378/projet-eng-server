import { PubSub, withFilter } from "graphql-subscriptions";
import { Context } from "../context.js";

const pubSub = new PubSub()

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
export const resolvers = {
  Question:{
    answers: async (parent,args,{prisma}:Context) => {
      const answers = await prisma.answer.findMany({
        where:{
          questionId: parent.id
        }
      })
      return answers
    }
  },
  Query: {
    questions: async (parent,args, {prisma}:Context) => {
      const questions = await prisma.question.findMany()
      return questions
    },
    books: async (parent, args, context: Context) => {
      return books
    },
    question: async (parent, {questionId}, {prisma}:Context) => {
      const question = await prisma.question.findUnique({
        where: {
          id:questionId
        }
      })
      return question
    },
    answers: async(parent,{questionId}, {prisma}: Context) => {
      const answers = await prisma.answer.findMany({where:{questionId:questionId}})
      return answers
    },
  },
  Mutation: {
    submitAnswer: async(parent,{questionId,content,age,sex,location}, {prisma}: Context) => {
      const answer = await prisma.answer.create({
        data: {
          questionId,
          age,
          sex,
          location,
          content
        }
      })
      const answers = await prisma.answer.findMany({
        where:{
          questionId:questionId
        }
      })
      pubSub.publish("ANSWER_ADDED",{answers})
      return answer
    }
  },

  Subscription: {
    answers: {
      subscribe: withFilter(
        () => pubSub.asyncIterator('ANSWER_ADDED'),
        (payload, variables) => {
          // Only push an update if the comment is on
          // the correct repository for this operation
          return (
            payload.answers[0].questionId === variables.questionId
          );
        },
      ),
    },
  },
}
