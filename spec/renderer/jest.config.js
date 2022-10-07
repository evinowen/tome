module.exports = {
  rootDir: '../..',
  testMatch: ['<rootDir>/spec/renderer/unit/**/*.spec.js'],
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/renderer/**/*.{js,vue}'],
  coverageDirectory: '<rootDir>/reports/renderer/coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/renderer/$1',
    '^[?]/(.*)$': '<rootDir>/spec/renderer/$1',
    '\\.css$': '<rootDir>/spec/renderer/stubs/CssStub.js',
    '@fontsource/montserrat': '<rootDir>/spec/renderer/stubs/CssStub.js'
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/reports/renderer/junit/jest'
      }
    ]
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!vuetify)'],
  setupFiles: ['<rootDir>/spec/renderer/setup.js']
}