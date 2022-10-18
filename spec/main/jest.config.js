module.exports = {
  preset: 'ts-jest',
  rootDir: '../..',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/spec/main/tsconfig.json'
    }
  },
  testMatch: ['<rootDir>/spec/main/unit/**/*.spec.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/main/**/*.ts'],
  // collectCoverageFrom: ['<rootDir>/src/main/components/file.ts'],
  coverageDirectory: '<rootDir>/reports/main/coverage',
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleDirectories: [
    'node_modules', '<rootDir>/src/main'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/main/$1',
    '^\\?/(.*)$': '<rootDir>/spec/main/$1',
    '^nodegit$': '<rootDir>/spec/main/mocks/nodegit',
    '^node:(fs|path|os|vm)$': '<rootDir>/spec/main/mocks/node/$1',
    '^support:(disk)$': '<rootDir>/spec/main/mocks/support/$1'
  },
  moduleFileExtensions: ['ts', 'js'],
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
