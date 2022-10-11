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
    'unicorn/filename-case': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/no-null': 'off',
    'unicorn/switch-case-braces': 'off',
    'unicorn/no-static-only-class': 'off',
    'quote-props': ['error', 'consistent'],
    'camelcase': 'off',
    'no-console': 'error',
    'no-debugger': 'error',
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off'
  }
}
