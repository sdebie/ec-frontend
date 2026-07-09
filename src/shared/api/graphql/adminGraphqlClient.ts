import { GraphQLClient } from 'graphql-request'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

const endpoint = `${window.location.origin}/api/graphql`

export const adminGraphqlClient = new GraphQLClient(endpoint, {
  requestMiddleware: (request) => {
    const token = useAdminAuthStore.getState().token
    return {
      ...request,
      headers: {
        ...request.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  },
})
