import {
  buildSchema,
  parse,
  validate,
  visit,
  type GraphQLSchema,
} from 'graphql'
import { describe, expect, it } from 'vitest'

import schemaSDL from '../schema.graphql?raw'

/**
 * GraphQL schema-contract guard.
 *
 * Every `gql\`...\`` operation in the codebase is parsed and validated against a
 * committed snapshot of the backend schema (src/shared/api/graphql/schema.graphql,
 * regenerated with `npm run schema:refresh` against a running backend).
 *
 * This catches the class of bug that mocked unit tests cannot: an operation that
 * references a type or field the backend does not expose. The concrete incident
 * this guards against was `$productId: ID!` in the SetProductFeatured mutation —
 * the SmallRye schema has no `ID` type (the arg is `String`), so `validate()`
 * reports "Unknown type ID". Unit tests mock the transport and never see it.
 *
 * When you add or change a GraphQL operation, this test validates it automatically —
 * no registration step. When the backend schema changes, run `npm run schema:refresh`.
 */

// Vite raw-imports every source file's text; no fs / glob dependency needed.
const sources = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Static `gql\`...\`` literals only (no template interpolation is used in this
// codebase, so a non-backtick capture is exact and avoids a real GraphQL parser
// dependency at the extraction stage).
const GQL_LITERAL = /\bgql`([^`]*)`/g

const BUILT_IN_SCALARS = new Set(['Int', 'Float', 'String', 'Boolean', 'ID'])

/**
 * SmallRye serves the SDL without declaring its custom scalars (BigDecimal,
 * DateTime, BigInteger, ...), which makes the raw snapshot unbuildable. We keep
 * the snapshot byte-faithful to what the backend emits and, at build time,
 * declare any type that is *referenced but never defined* as a scalar. This is
 * intentionally narrow: a name is only auto-declared if the schema itself uses
 * it. `ID` is not referenced anywhere in this schema, so it stays undeclared —
 * meaning the `$productId: ID!` class of bug is still caught by validate().
 */
function buildContractSchema(sdl: string): GraphQLSchema {
  const ast = parse(sdl)
  const defined = new Set<string>()
  const referenced = new Set<string>()

  visit(ast, {
    // Type definitions/extensions expose a `.name` for the declared type.
    ScalarTypeDefinition: (n) => void defined.add(n.name.value),
    ObjectTypeDefinition: (n) => void defined.add(n.name.value),
    InterfaceTypeDefinition: (n) => void defined.add(n.name.value),
    UnionTypeDefinition: (n) => void defined.add(n.name.value),
    EnumTypeDefinition: (n) => void defined.add(n.name.value),
    InputObjectTypeDefinition: (n) => void defined.add(n.name.value),
    NamedType: (n) => void referenced.add(n.name.value),
  })

  const undeclared = [...referenced].filter(
    (name) => !defined.has(name) && !BUILT_IN_SCALARS.has(name),
  )
  const scalarDecls = undeclared.map((name) => `scalar ${name}`).join('\n')

  return buildSchema(scalarDecls ? `${scalarDecls}\n${sdl}` : sdl)
}

/**
 * Operations that DO NOT currently match the backend schema — pre-existing drift
 * surfaced when this guard was introduced, each tracked by its own task. Keyed by
 * GraphQL operation name.
 *
 * This is self-policing: an allowlisted operation is asserted to STILL be invalid.
 * When the corresponding fix lands, its `validate()` returns no errors and the
 * assertion FAILS until the entry is removed here — so the allowlist cannot rot
 * into silently masking a now-correct (or newly-broken) operation.
 */
const KNOWN_DRIFT: Record<string, string> = {}

interface Operation {
  file: string
  name: string
  source: string
}

function operationName(source: string): string {
  const def = parse(source).definitions[0]
  return def.kind === 'OperationDefinition' && def.name ? def.name.value : '(anonymous)'
}

function extractOperations(): Operation[] {
  const ops: Operation[] = []
  for (const [file, text] of Object.entries(sources)) {
    // Skip this test and anything under a __tests__ / test dir.
    if (file.includes('/__tests__/') || file.includes('/test/')) continue
    for (const match of text.matchAll(GQL_LITERAL)) {
      const source = match[1]
      ops.push({ file, name: operationName(source), source })
    }
  }
  return ops
}

describe('GraphQL schema contract', () => {
  let schema: GraphQLSchema

  it('builds the committed schema snapshot', () => {
    schema = buildContractSchema(schemaSDL)
    expect(schema.getQueryType()).toBeTruthy()
    expect(schema.getMutationType()).toBeTruthy()
  })

  const operations = extractOperations()

  it('discovers gql operations to validate', () => {
    // Sanity check that extraction works; if this ever hits 0 the guard is silently
    // covering nothing (e.g. gql tag renamed) and should be investigated.
    expect(operations.length).toBeGreaterThan(0)
  })

  it('catches the ID! regression it was built for', () => {
    // The original incident: SetProductFeatured declared `$productId: ID!`, but the
    // SmallRye schema has no ID type (the arg is String). Prove the guard flags it.
    schema ??= buildContractSchema(schemaSDL)
    const buggy = `
      mutation SetProductFeatured($productId: ID!, $featured: Boolean!) {
        setProductFeatured(productId: $productId, featured: $featured) { productId featured }
      }
    `
    const errors = validate(schema, parse(buggy))
    expect(errors.map((e) => e.message).join('\n')).toContain('ID')
  })

  it.each(operations.map((op) => [`${op.name} (${op.file})`, op] as const))(
    'operation matches the backend schema: %s',
    (_label, op) => {
      schema ??= buildContractSchema(schemaSDL)
      const errors = validate(schema, parse(op.source))
      const drift = KNOWN_DRIFT[op.name]

      if (drift) {
        // Self-policing: known-drifted ops must STILL be invalid. When the fix
        // lands, remove the KNOWN_DRIFT entry (this assertion forces it).
        expect(
          errors.length,
          `Operation "${op.name}" is allowlisted as known drift (${drift}) but now ` +
            `validates cleanly. Remove it from KNOWN_DRIFT in this test.`,
        ).toBeGreaterThan(0)
        return
      }

      if (errors.length > 0) {
        throw new Error(
          `GraphQL operation "${op.name}" in ${op.file} does not match the backend ` +
            `schema (src/shared/api/graphql/schema.graphql):\n` +
            errors.map((e) => `  - ${e.message}`).join('\n') +
            `\n\nOperation:\n${op.source.trim()}`,
        )
      }
    },
  )

  it('contains no entity types in the SDL (entity-boundary-cleanup regression guard)', () => {
    schema ??= buildContractSchema(schemaSDL)
    const entityTypes = Object.keys(schema.getTypeMap())
      .filter((name) => !name.startsWith('__'))
      .filter((name) => /Entity(Input)?$/.test(name))
    expect(entityTypes).toEqual([])
  })
})
