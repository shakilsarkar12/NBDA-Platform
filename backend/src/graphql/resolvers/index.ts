import { authResolvers } from "./auth.resolvers.js";

export const resolvers = {
  Query: {
    health: () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    }),
  },
  Mutation: {
    ...authResolvers.Mutation,
  },
};
