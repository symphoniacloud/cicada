// eslint-disable-next-line no-undef
module.exports = {
  env: {
    node: true,
    es2022: true
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [],
  ignorePatterns: ['htmx.min.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint']
}
