import { GraphQLClient } from 'graphql-request'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'

const endpoint = `${window.location.origin}/api/graphql`

export const graphqlClient = new GraphQLClient(endpoint, {
  requestMiddleware: (request) => {
    const token = useCustomerAuthStore.getState().token
    return {
      ...request,
      headers: {
        ...request.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  },
})
