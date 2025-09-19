import unjs from 'eslint-config-unjs'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import sort from 'eslint-plugin-sort'

export default unjs(
  {
    ignores: [
      // ignore paths
      'coverage',
      'dist',
      'node_modules',
      'tmp',
    ],
    markdown: {
      rules: {
        // markdown rule overrides
      },
    },
    rules: {
      // rule overrides
      '@typescript-eslint/no-require-imports': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
  sort.configs['flat/recommended'],
  {
    rules: {
      'sort/string-enums': 'error',
      'sort/string-unions': 'error',
      'sort/type-properties': 'error',
    },
  },
  eslintPluginPrettierRecommended,
)
