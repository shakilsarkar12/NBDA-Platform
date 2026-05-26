import { GraphQLError } from "graphql";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toGraphQLError(error: unknown): GraphQLError {
  if (error instanceof AppError) {
    return new GraphQLError(error.message, {
      extensions: { code: error.code, http: { status: error.statusCode } },
    });
  }

  if (error instanceof GraphQLError) {
    return error;
  }

  console.error("[graphql] unexpected error:", error);
  return new GraphQLError("Internal server error", {
    extensions: { code: "INTERNAL_SERVER_ERROR", http: { status: 500 } },
  });
}
