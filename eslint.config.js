import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import-x'
import {createNodeResolver} from 'eslint-plugin-import-x/node-resolver'
import {defineConfig, globalIgnores} from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist', 'build']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            'import-x': importPlugin,
        },
        settings: {
            'import-x/resolver-next': [
                createNodeResolver({
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
                }),
            ],
        },
        rules: {
            // Library APIs such as React Hook Form and TanStack Table cannot yet
            // preserve React Compiler memoization. Keep diagnostics visible but
            // do not fail the quality gate for an upstream limitation.
            'react-hooks/incompatible-library': 'warn',
            'react-hooks/preserve-manual-memoization': 'warn',
            'react-hooks/set-state-in-effect': 'warn',
            // HMR ergonomics: production correctness is unaffected.
            'react-refresh/only-export-components': 'warn',
            'import-x/no-restricted-paths': ['error', {
                zones: [
                    {
                        target: './src/admin',
                        from: './src/storefront',
                        message: 'Admin domain must not import from storefront domain. Use src/shared/ for cross-domain utilities.',
                    },
                    {
                        target: './src/storefront',
                        from: './src/admin',
                        message: 'Storefront domain must not import from admin domain. Use src/shared/ for cross-domain utilities.',
                    },
                    {
                        target: './src/shared',
                        from: './src/admin',
                        message: 'Shared code must not depend on admin domain.',
                    },
                    {
                        target: './src/shared',
                        from: './src/storefront',
                        message: 'Shared code must not depend on storefront domain.',
                    },
                ],
            }],
        },
    },
    {
        files: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
        rules: {
            // Mocks deliberately cross untyped third-party boundaries. The
            // no-any rule remains enforced in production source.
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/prefer-as-const': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
    {
        files: ['src/shared/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': ['error', {
                patterns: [
                    {group: ['*/storefront/*', '../storefront/*'], message: 'shared/ must not import from storefront/'},
                    {group: ['*/admin/*', '../admin/*'], message: 'shared/ must not import from admin/'},
                ],
            }],
        },
    },
])
