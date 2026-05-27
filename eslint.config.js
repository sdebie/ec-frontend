import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import {defineConfig, globalIgnores} from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

/**
 * Feature isolation: a single zone `{ target: './src/features/*', from: './src/features/*' }` never
 * matched nested files (`features/cart/cartStore.ts`) because minimatch `*` is one segment. Use one
 * zone per top-level feature folder so nested files are in-zone and cross-feature imports fail.
 * Keep this list in sync when adding `src/features/<name>/`.
 */
const featureTopLevelFolders = [
    'auth',
    'cart',
    'catalog',
    'checkout',
    'wholesale-application',
]

const featureCrossImportZones = featureTopLevelFolders.map((name) => ({
    target: `**/src/features/${name}/**`,
    from: `**/src/features/**`,
    except: [`**/src/features/${name}/**`],
}))

const restrictedPathZones = [
    {target: './src/primitives', from: './src/features'},
    {target: './src/primitives', from: './src/tenants'},
    {target: './src/primitives', from: './src/admin'},
    {target: './src/features', from: './src/tenants'},
    {target: './src/features', from: './src/admin'},
    ...featureCrossImportZones,
    {target: './src/tenants/default', from: './src/tenants/uvh'},
    {target: './src/tenants/uvh', from: './src/tenants/default'},
]

/** Resolves `@/*` → `src/*` so import/no-restricted-paths applies to aliased TS imports. */
const importResolverSettings = {
    'import/resolver': {
        typescript: {
            project: './tsconfig.json',
        },
        node: true,
    },
}

const importRestrictionRules = {
    'import/order': [
        'error',
        {
            groups: [
                'builtin',
                'external',
                'internal',
                'parent',
                'sibling',
                'index',
                'object',
                'type',
            ],
            alphabetize: {order: 'asc', caseInsensitive: true},
            'newlines-between': 'always',
        },
    ],
    'import/no-restricted-paths': [
        'error',
        {
            zones: restrictedPathZones,
        },
    ],
}

export default defineConfig([
    globalIgnores(['dist', 'build']),
    {
        files: ['**/*.{js,jsx}'],
        settings: importResolverSettings,
        extends: [js.configs.recommended],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: {jsx: true},
                sourceType: 'module',
            },
        },
        plugins: {
            import: importPlugin,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs['recommended-latest'].rules,
            ...reactRefresh.configs.vite.rules,
            ...importRestrictionRules,
            'max-lines': ['warn', {max: 400, skipBlankLines: true, skipComments: true}],
            'no-unused-vars': ['error', {varsIgnorePattern: '^[A-Z_]'}],
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        settings: importResolverSettings,
        extends: [js.configs.recommended],
        languageOptions: {
            parser: tsParser,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {jsx: true},
            },
        },
        plugins: {
            import: importPlugin,
            '@typescript-eslint': tsPlugin,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs['recommended-latest'].rules,
            ...reactRefresh.configs.vite.rules,
            ...importRestrictionRules,
            // Providers/contexts legitimately export hooks alongside components.
            'react-refresh/only-export-components': 'off',
            'max-lines': ['warn', {max: 400, skipBlankLines: true, skipComments: true}],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^[A-Z_]',
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        files: [
            'vite.config.ts',
            'vitest.config.ts',
            'playwright.config.ts',
            'tests/**/*.{ts,tsx}',
            'src/services/**/*.{ts,tsx}',
        ],
        languageOptions: {
            globals: {...globals.node},
        },
    },
])
