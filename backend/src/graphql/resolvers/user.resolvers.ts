import type { GraphQLContext } from "../context.js";
import { toGraphQLError, AppError } from "../../utils/errors.js";
import { toGraphQLUser } from "../mappers/user.mapper.js";
import {
  getUserByIdOrThrow,
  logBloodDonation,
  searchDonorsMasked,
  setAvailability,
  viewDonorContactWithAudit,
} from "../../services/user.service.js";

function requireGraphqlAuth(ctx: GraphQLContext): string {
  if (!ctx.authUserId) {
    throw new AppError("Authentication required", "UNAUTHORIZED", 401);
  }
  return ctx.authUserId;
}

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      try {
        const userId = requireGraphqlAuth(ctx);
        const user = await getUserByIdOrThrow(userId);
        return toGraphQLUser(user);
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    donors: async () => {
      try {
        return await searchDonorsMasked();
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
  },
  Mutation: {
    viewDonorContact: async (
      _: unknown,
      { donorId }: { donorId: string },
      ctx: GraphQLContext
    ) => {
      try {
        const viewerId = requireGraphqlAuth(ctx);
        const result = await viewDonorContactWithAudit(viewerId, donorId);
        return {
          success: true,
          message: "Contact viewed successfully.",
          phone: result.phone,
        };
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    updateAvailability: async (
      _: unknown,
      { isAvailable }: { isAvailable: boolean },
      ctx: GraphQLContext
    ) => {
      try {
        const userId = requireGraphqlAuth(ctx);
        const user = await setAvailability(userId, isAvailable);
        return {
          success: true,
          message: "Availability updated successfully.",
          user: toGraphQLUser(user),
        };
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
    logDonation: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      try {
        const userId = requireGraphqlAuth(ctx);
        const user = await logBloodDonation(userId);
        return {
          success: true,
          message: "Donation logged successfully.",
          user: toGraphQLUser(user),
        };
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
  },
};

