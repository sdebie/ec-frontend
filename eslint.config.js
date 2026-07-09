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
