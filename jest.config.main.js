module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'electron/**/*.js'
  ],
  coverageDirectory: './reports/main/coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
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
