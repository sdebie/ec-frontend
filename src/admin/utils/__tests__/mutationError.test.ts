import { describe, it, expect } from 'vitest'
import { ClientError } from 'graphql-request'
import { mutationErrorMessage } from '../mutationError'

const clientError = (message: string) =>
  new ClientError(
    ({ errors: [{ message }], status: 200, headers: new Headers() } as unknown as ConstructorParameters<typeof ClientError>[0]),
    { query: '' },
  )

describe('mutationErrorMessage', () => {
  it('returns the server message when the GraphQL error carries a real explanation', () => {
    expect(mutationErrorMessage(clientError('Category with name already exists'), 'Failed')).toBe(
      'Category with name already exists',
    )
  })

  it('falls back on the masked "System error" message — it explains nothing to the user', () => {
    expect(mutationErrorMessage(clientError('System error'), 'Failed to save category')).toBe(
      'Failed to save category',
    )
  })

  it('falls back when the response has no errors array', () => {
    const empty = new ClientError(
      ({ status: 200, headers: new Headers() } as unknown as ConstructorParameters<typeof ClientError>[0]),
      { query: '' },
    )
    expect(mutationErrorMessage(empty, 'Failed')).toBe('Failed')
  })

  it('falls back for non-GraphQL errors', () => {
    expect(mutationErrorMessage(new Error('network down'), 'Failed')).toBe('Failed')
    expect(mutationErrorMessage(undefined, 'Failed')).toBe('Failed')
  })
})
