module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!**/node_modules/**'
  ],
  coverageDirectory: './reports/coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  },
  moduleNameMapper: {
    '\\.css$': '<rootDir>/tests/stubs/CssStub.js',
    '^vuetify/lib$': 'vuetify'
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports/junit/jest'
      }
    ]
  ],
  transformIgnorePatterns: ['node_modules/(?!vuetify)']
}
