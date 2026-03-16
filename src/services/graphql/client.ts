import { GraphQLClient } from "graphql-request";
import { getServiceEndpoint } from "@/utils/HostnameResolver";

const clients = new Map<string, GraphQLClient>();

function resolveEnvGraphQLEndpoint(): string | undefined {
  const meta = import.meta as unknown as { env?: Record<string, string | undefined> };

  if (typeof import.meta !== "undefined" && meta.env) {
    const env = meta.env;
    return env.VITE_GRAPHQL_ENDPOINT || env.VITE_API_URL || env.REACT_APP_API_URL;
  }

  if (typeof process !== "undefined" && process.env) {
    return process.env.VITE_GRAPHQL_ENDPOINT || process.env.VITE_API_URL || process.env.REACT_APP_API_URL;
  }

  return undefined;
}

export function resolveGraphQLEndpoint(): string {
  const envEndpoint = resolveEnvGraphQLEndpoint();

  if (envEndpoint && envEndpoint.length > 0) {
    return envEndpoint;
  }

  return `${getServiceEndpoint(8080)}/api/graphql`;
}

export function createGraphQLClient(endpoint: string = resolveGraphQLEndpoint()): GraphQLClient {
  return new GraphQLClient(endpoint);
}

export function getGraphQLClient(endpoint: string = resolveGraphQLEndpoint()): GraphQLClient {
  const cached = clients.get(endpoint);
  if (cached) {
    return cached;
  }

  const client = createGraphQLClient(endpoint);
  clients.set(endpoint, client);
  return client;
}


