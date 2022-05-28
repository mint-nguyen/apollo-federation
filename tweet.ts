import { buildFederatedSchema } from "@apollo/federation";
import { ApolloServer, gql } from "apollo-server";
import Tweet from "./datasources/models/Tweet";
import TweetAPI from "./datasources/tweet";
import mongoStore from "./mongoStore";

const typeDefs = gql`
  type Tweet {
    text: String
    id: ID!
    creator: User
  }
  extend type User @key(fields: "id") {
    id: ID! @external
    tweets: [Tweet]
  }
  extend type Query {
    tweet(id: ID!): Tweet
    tweets: [Tweet]
  }
  extend type Mutation {
    createTweet(tweetPayload: TweetPayload): Tweet
  }
  input TweetPayload {
    userId: String
    text: String
  }
`;

const resolvers = {
  Query: {
    tweet: async (_, { id }) => {
      const currentTweet = await Tweet.findOne({ _id: id });
      return currentTweet;
    },
    tweets: async () => {
      const tweetsList = await Tweet.find({});
      return tweetsList;
    },
  },
  Tweet: {
    creator: (tweet) => ({ __typename: "User", id: tweet.userId }),
  },
  User: {
    tweets: async (user) => {
      const tweetsByUser = await Tweet.find({ userId: user.id });
      return tweetsByUser;
    },
  },
  Mutation: {
    createTweet: async (_, { tweetPayload: { text, userId } }) => {
      const newTweet = new Tweet({ text, userId });
      const createdTweet = await newTweet.save();
      return createdTweet;
    },
  },
};

mongoStore();

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
});

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`Tweet service ready at url: ${url}`);
});
