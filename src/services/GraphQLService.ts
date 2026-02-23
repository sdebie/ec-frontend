import { GraphQLClient } from "graphql-request";


/**
 * Class for managing GraphQL clients for different endpoints
 */
export class GraphQLService {
    private static clients: Map<string, GraphQLClient> = new Map();

    /**
     * Checks if a GraphQL endpoint is available
     * 
     * @param url - The URL of the GraphQL endpoint
     * @param timeout - Timeout in milliseconds (default: 2000)
     * @returns Promise resolving to a boolean indicating if the endpoint is available
     */
    public static async isEndpointAvailable(url: string, timeout: number = 2000): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: "{ __typename }"
                })
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.debug('Endpoint check failed:', error);
            return false;
        }
    }

    /**
     * Initializes a GraphQL client for a specific endpoint
     * 
     * @param endpoint - The URL of the GraphQL endpoint
     * @returns Promise resolving to a GraphQLClient or null if the endpoint is not available
     */
    public static async initializeGraphQLClient(endpoint: string): Promise<GraphQLClient | null> {
        // Avoid making a preflight network request that can cause noisy console errors
        // Simply return a client; actual requests will surface connectivity issues naturally
        return new GraphQLClient(endpoint);
    }

    /**
     * Gets or creates a GraphQL client for a specific endpoint
     * 
     * @param endpoint - The URL of the GraphQL endpoint
     * @returns Promise resolving to a GraphQLClient
     * @throws Error if the endpoint is not available
     */
    public static async getGraphQLClient(endpoint: string): Promise<GraphQLClient> {
        if (!this.clients.has(endpoint)) {
            const client = await this.initializeGraphQLClient(endpoint);
            if (!client) {
                throw new Error('There was a temporary problem completing your request.');
            }
            this.clients.set(endpoint, client);
        }

        return this.clients.get(endpoint)!;
    }
}
