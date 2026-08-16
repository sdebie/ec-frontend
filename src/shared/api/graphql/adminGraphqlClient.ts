import { GraphQLClient } from 'graphql-request'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { withBearerToken } from './authRequestMiddleware'

const endpoint = `${window.location.origin}/api/graphql`

export const adminGraphqlClient = new GraphQLClient(endpoint, {
  requestMiddleware: withBearerToken(() => useAdminAuthStore.getState().token),
})
