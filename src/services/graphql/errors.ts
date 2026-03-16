import { ClientError } from "graphql-request";

export type NormalizedGraphQLError = {
  message: string;
  status?: number;
  code?: string;
  graphQLErrors: Array<{ message: string; path?: readonly (string | number)[]; code?: string }>;
  originalError: unknown;
  isUnauthorized: boolean;
};

export class GraphQLRequestError extends Error {
  readonly normalized: NormalizedGraphQLError;

  constructor(normalized: NormalizedGraphQLError) {
    super(normalized.message);
    this.name = "GraphQLRequestError";
    this.normalized = normalized;
  }
}

export function isUnauthorizedStatus(status?: number): boolean {
  return status === 401 || status === 419 || status === 440;
}

export function normalizeGraphQLError(error: unknown): GraphQLRequestError {
  if (error instanceof GraphQLRequestError) {
    return error;
  }

  if (error instanceof ClientError) {
    const status = error.response.status;
    const gqlErrors = (error.response.errors || []).map((entry) => ({
      message: entry.message,
      path: entry.path,
      code: typeof entry.extensions?.code === "string" ? entry.extensions.code : undefined,
    }));

    const firstCode = gqlErrors.find((entry) => !!entry.code)?.code;
    const fallbackMessage = gqlErrors[0]?.message || "GraphQL request failed";

    return new GraphQLRequestError({
      message: fallbackMessage,
      status,
      code: firstCode,
      graphQLErrors: gqlErrors,
      originalError: error,
      isUnauthorized: isUnauthorizedStatus(status),
    });
  }

  const fallbackMessage = error instanceof Error ? error.message : "Unexpected request error";
  return new GraphQLRequestError({
    message: fallbackMessage,
    graphQLErrors: [],
    originalError: error,
    isUnauthorized: false,
  });
}

