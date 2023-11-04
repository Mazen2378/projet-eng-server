import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./schema/resolvers.js";
import { Context, createContext } from "./context.js";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";

import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
const port = process.env.PORT;

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
const wsServerCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer<Context>({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await wsServerCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
app.use(
  "/graphql",
  bodyParser.json(),
  expressMiddleware(server, {
    context: createContext,
  }),
);
httpServer.listen(port, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${port}/graphql`);
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${port}/graphql`,
  );
});
