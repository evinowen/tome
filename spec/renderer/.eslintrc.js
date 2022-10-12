module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:unicorn/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/recommended',
    '@vue/typescript',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'unicorn']
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'camelcase': 'off',
    'no-console': 'error',
    'no-debugger': 'error',
    'quote-props': ['error', 'consistent'],
    'unicorn/filename-case': 'off',
    'unicorn/no-static-only-class': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/switch-case-braces': 'off'
  }
}
