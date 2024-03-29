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
    '@vue/typescript',
    '@vue/typescript/recommended',
    'plugin:@stylistic/recommended-extends',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    plugins: [ '@typescript-eslint', 'unicorn', '@stylistic' ],
  },
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'camelcase': 'off',
    'no-console': 'error',
    'no-debugger': 'error',
    'quote-props': [ 'error', 'consistent' ],
    'unicorn/filename-case': 'off',
    'unicorn/no-static-only-class': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/switch-case-braces': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/prop-name-casing': [ 'error', 'snake_case' ],
    'vue/valid-v-slot': 'off',
    '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
    '@stylistic/arrow-parens': [ 'error', 'always' ],
    '@stylistic/brace-style': [ 'error', '1tbs' ],
    '@stylistic/indent': [ 'error', 2 ],
    '@stylistic/quote-props': [ 'error', 'consistent' ],
    '@stylistic/quotes': [ 'error', 'single' ],
    '@stylistic/semi': [ 'error', 'never' ],
    '@stylistic/space-before-function-paren': [ 'error', 'always' ],
  },
}
