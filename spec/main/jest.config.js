module.exports = {
  rootDir: '../..',
  testMatch: ['<rootDir>/spec/main/unit/**/*.spec.js'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/dist/main/**/*.js'],
  coverageDirectory: '<rootDir>/reports/main/coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/dist/main/$1',
    '^[?]/(.*)$': '<rootDir>/spec/main/$1'
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/reports/main/junit/jest'
      }
    ]
  ]
}
