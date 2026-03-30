import {ClientError} from "graphql-request";

export function extractTechnicalDetails(error: unknown): string {
    if (error instanceof ClientError) {
        const gqlErrors = error.response?.errors;
        if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
            return gqlErrors.map((e: { message?: string }) => e.message ?? String(e)).join("\n");
        }
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    try {
        return JSON.stringify(error, null, 2);
    } catch {
        return String(error);
    }
}

