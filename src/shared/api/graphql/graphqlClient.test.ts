import { describe, it, expect } from 'vitest'
import { graphqlClient } from './graphqlClient'
import { adminGraphqlClient } from './adminGraphqlClient'

describe('GraphQL client endpoint resolution', () => {
  it('graphqlClient resolves endpoint to /graphql', () => {
    expect(graphqlClient.url).toBe('http://localhost:3000/api/graphql')
  })

  it('adminGraphqlClient resolves endpoint to /graphql', () => {
    expect(adminGraphqlClient.url).toBe('http://localhost:3000/api/graphql')
  })
})
