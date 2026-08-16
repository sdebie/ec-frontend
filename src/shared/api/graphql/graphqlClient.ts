import { GraphQLClient } from 'graphql-request'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { withBearerToken } from './authRequestMiddleware'

const endpoint = `${window.location.origin}/api/graphql`

export const graphqlClient = new GraphQLClient(endpoint, {
  requestMiddleware: withBearerToken(() => useCustomerAuthStore.getState().token),
})
