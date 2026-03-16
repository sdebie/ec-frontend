import {GraphQLClient, type RequestDocument, type Variables} from "graphql-request";
import {
    clearAuthSession,
    createAuthHeaderProvider,
    getGraphQLTokenProvider,
    type RequestHeaderProvider,
} from "./auth";
import {getGraphQLClient, resolveGraphQLEndpoint} from "./client";
import {GraphQLRequestError, normalizeGraphQLError} from "./errors";

type RequestHeaders = Record<string, string>;

export type GraphQLRequesterConfig = {
    endpoint?: string;
    client?: GraphQLClient;
    headerProviders?: RequestHeaderProvider[];
    onUnauthorized?: (error: GraphQLRequestError) => void | Promise<void>;
    onError?: (error: GraphQLRequestError) => void | Promise<void>;
};

export type GraphQLRequestConfig = {
    headers?: RequestHeaders;
};

async function resolveHeaders(
    providers: RequestHeaderProvider[],
    requestHeaders?: RequestHeaders,
): Promise<RequestHeaders> {
    const resolvedHeaders: RequestHeaders = {...(requestHeaders || {})};

    for (const provider of providers) {
        const headers = await provider();
        Object.assign(resolvedHeaders, headers);
    }

    return resolvedHeaders;
}

export function createGraphQLRequester(config: GraphQLRequesterConfig = {}) {
    const endpoint = config.endpoint || resolveGraphQLEndpoint();
    const client = config.client || getGraphQLClient(endpoint);
    const headerProviders = config.headerProviders || [createAuthHeaderProvider()];

    return async function request<TData, TVariables extends Variables = Variables>(
        document: RequestDocument,
        variables?: TVariables,
        requestConfig?: GraphQLRequestConfig,
    ): Promise<TData> {
        async function executeRequest(): Promise<TData> {
            const headers = await resolveHeaders(headerProviders, requestConfig?.headers);
            return client.request<TData, TVariables>(document, variables, headers);
        }

        try {
            return await executeRequest();
        } catch (error) {
            let normalizedError = normalizeGraphQLError(error);

            if (normalizedError.normalized.isUnauthorized) {
                const refreshAccessToken = getGraphQLTokenProvider().refreshAccessToken;

                if (refreshAccessToken) {
                    const refreshedToken = await refreshAccessToken();

                    if (refreshedToken) {
                        try {
                            return await executeRequest();
                        } catch (retryError) {
                            normalizedError = normalizeGraphQLError(retryError);
                        }
                    }
                }
            }

            if (normalizedError.normalized.isUnauthorized) {
                await (config.onUnauthorized || clearAuthSession)(normalizedError);
            }

            if (config.onError) {
                await config.onError(normalizedError);
            }

            throw normalizedError;
        }
    };
}

export const requestGraphQL = createGraphQLRequester();


