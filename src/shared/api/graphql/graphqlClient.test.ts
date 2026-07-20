import { describe, it, expect } from 'vitest'
import { graphqlClient } from './graphqlClient'
import { adminGraphqlClient } from './adminGraphqlClient'

describe('GraphQL client endpoint resolution', () => {
  it('graphqlClient resolves endpoint to /graphql', () => {
    expect((graphqlClient as unknown as { url: string })['url']).toBe('http://localhost:3000/api/graphql')
  })

  it('adminGraphqlClient resolves endpoint to /graphql', () => {
    expect((adminGraphqlClient as unknown as { url: string })['url']).toBe('http://localhost:3000/api/graphql')
  })
})
