import {ClientError} from 'graphql-request'

/**
 * User-facing message for a failed admin mutation: the server's GraphQL error
 * message when it carries a real explanation, otherwise the caller's fallback.
 * Backend exceptions outside the GraphQL message whitelist render as the
 * literal "System error", which explains nothing — the fallback reads better.
 */
export function mutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ClientError) {
    const message = error.response.errors?.[0]?.message
    if (message && message !== 'System error') return message
  }
  return fallback
}
