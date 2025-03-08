import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }, {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/curly-newline': ['warn', 'always'],
      '@stylistic/indent': ['warn', 2],
      '@stylistic/jsx-equals-spacing': ['warn', 'never'],
      '@stylistic/jsx-pascal-case': ['warn'],
      '@stylistic/jsx-quotes': ['warn', 'prefer-double'],
      '@stylistic/jsx-self-closing-comp': ['warn'],
      '@stylistic/jsx-wrap-multilines': ['warn'],
      '@stylistic/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
      '@stylistic/no-trailing-spaces': 'warn',
      '@stylistic/no-whitespace-before-property': 'error',
      '@stylistic/quote-props': ['warn', 'as-needed'],
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/semi': ['warn', 'never'],
      '@stylistic/rest-spread-spacing': ['error', 'never'],
      '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }]
    }
  }
)
