import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import deprecation from 'eslint-plugin-deprecation'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default tseslint.config(
  {
    ignores: [
      '**/,.*',
      '**/*.config.ts',
      '**/*.config.cjs',
      '**/dist',
      '**/debug',
      '**/lib',
      '**/docs',
      '**/gen',
      '**/types',
      '**/builtin',
      '**/templates',
      'packages/protos',
      'packages/sdk/sync-sui-to-iota.ts'
    ]
  },

  ...tseslint.configs.recommended,

  ...fixupConfigRules(compat.extends('plugin:import-x/recommended', 'plugin:import-x/typescript', 'prettier')),

  {
    plugins: {
      'unused-imports': unusedImports
    },
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs', '*.js', 'packages/cli-alias/index.js']
        }
      }
    },
    rules: {
      '@typescript-eslint/no-inferrable-types': ['off'],
      '@typescript-eslint/no-empty-function': ['off'],
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/no-this-alias': ['off'],
      '@typescript-eslint/no-explicit-any': ['off'],

      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description'
        }
      ],

      'import-x/no-named-as-default': ['off'],
      'import-x/no-unresolved': ['off'],
      'unused-imports/no-unused-imports': 'error'
    }
  },

  {
    files: ['packages/sdk/**/*.ts'],
    plugins: {
      deprecation: fixupPluginRules(deprecation)
    },
    rules: {
      'deprecation/deprecation': 'warn'
    }
  }
)
