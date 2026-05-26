import {
  loginUser,
  registerUser,
  verifyOtpAndRegister,
} from "../../services/auth.service.js";
import { toGraphQLError } from "../../utils/errors.js";
import { toGraphQLUser } from "../mappers/user.mapper.js";

export const authResolvers = {
  Mutation: {
    register: async (
      _: unknown,
      { input }: { input: Parameters<typeof registerUser>[0] }
    ) => {
      try {
        return await registerUser(input);
      } catch (error) {
        throw toGraphQLError(error);
      }
    },

    verifyOtpAndRegister: async (
      _: unknown,
      {
        input,
      }: { input: Parameters<typeof verifyOtpAndRegister>[0] }
    ) => {
      try {
        const { user, accessToken } = await verifyOtpAndRegister(input);
        return {
          success: true,
          message: "Registration completed successfully.",
          accessToken,
          user: toGraphQLUser(user),
        };
      } catch (error) {
        throw toGraphQLError(error);
      }
    },

    login: async (
      _: unknown,
      { input }: { input: Parameters<typeof loginUser>[0] }
    ) => {
      try {
        const { user, accessToken } = await loginUser(input);
        return {
          success: true,
          message: "Login successful.",
          accessToken,
          user: toGraphQLUser(user),
        };
      } catch (error) {
        throw toGraphQLError(error);
      }
    },
  },
};
