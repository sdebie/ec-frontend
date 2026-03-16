import { GraphQLClient } from "graphql-request";
import { getGraphQLClient as getSharedGraphQLClient } from "./graphql/client";


/**
 * Legacy compatibility wrapper. New code should use src/services/graphql/client.ts directly.
 */
export class GraphQLService {
  public static async isEndpointAvailable(url: string, timeout: number = 2000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "{ __typename }",
        }),
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.debug("Endpoint check failed:", error);
      return false;
    }
  }

  public static async initializeGraphQLClient(endpoint: string): Promise<GraphQLClient | null> {
    return getSharedGraphQLClient(endpoint);
  }

  public static async getGraphQLClient(endpoint: string): Promise<GraphQLClient> {
    const client = await this.initializeGraphQLClient(endpoint);

    if (!client) {
      throw new Error("There was a temporary problem completing your request.");
    }

    return client;
  }
}
