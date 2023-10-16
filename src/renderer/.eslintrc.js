module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:unicorn/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/recommended',
    'plugin:vuetify/recommended',
    '@vue/typescript',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'unicorn']
  },
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'camelcase': 'off',
    'no-console': 'error',
    'no-debugger': 'error',
    'quote-props': ['error', 'consistent'],
    'unicorn/filename-case': 'off',
    'unicorn/no-static-only-class': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/switch-case-braces': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/prop-name-casing': ['error', 'snake_case'],
    'vue/valid-v-slot': 'off'
  }
}
