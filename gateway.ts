import { ApolloServer } from "apollo-server";
import { ApolloGateway } from "@apollo/gateway";

const gateway = new ApolloGateway({
  serviceList: [
    { name: "users", url: "http://localhost:4001" },
    { name: "tweets", url: "http://localhost:4002" },
  ],
});

const server = new ApolloServer({ gateway, subscriptions: false });

server.listen().then(({ url }) => {
  console.log(`Server ready at url: ${url}`);
});
