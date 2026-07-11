import type { CodegenConfig } from '@graphql-codegen/cli'

const apiUrl = process.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const config: CodegenConfig = {
  schema: `${apiUrl}/api/graphql`,
  documents: 'src/**/*.graphql',
  generates: {
    'src/shared/api/graphql/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
