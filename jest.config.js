module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}'
  ],
  coverageDirectory: './reports/coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '\\.css$': '<rootDir>/tests/stubs/CssStub.js',
    '@fontsource/montserrat': '<rootDir>/tests/stubs/CssStub.js'
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
  transformIgnorePatterns: ['node_modules/(?!vuetify)'],
  setupFiles: ['<rootDir>/tests/setup.js']
}
