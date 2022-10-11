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
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'unicorn']
  },
  rules: {
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/no-null': 'off',
    'unicorn/switch-case-braces': 'off',
    'unicorn/no-static-only-class': 'off',
    'quote-props': ['error', 'consistent'],
    'camelcase': 'off',
    'no-console': 'error',
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'vue/prop-name-casing': 'off',
    'vue/order-in-components': 'off',
    'vue/component-tags-order': 'off',
    'vue/html-quotes': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/no-v-html': 'off',
    'vue/valid-v-slot': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/multi-word-component-names': 'off'
  }
}
