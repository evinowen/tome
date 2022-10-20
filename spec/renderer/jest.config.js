module.exports = {
  rootDir: '../..',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/spec/renderer/tsconfig.json'
    },
    '@vue/vue2-jest': {
      tsconfig: '<rootDir>/spec/renderer/tsconfig.json'
    }
  },
  testMatch: ['<rootDir>/spec/renderer/unit/**/*.spec.ts'],
  transform: {
    ".*\\.(vue)$": "@vue/vue2-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  preset: '@vue/cli-plugin-unit-jest/presets/typescript',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/renderer/**/*.{ts,js,vue}'],
  coverageDirectory: '<rootDir>/reports/renderer/coverage',
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleDirectories: [
    'node_modules'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/renderer/$1',
    '^[?]/(.*)$': '<rootDir>/spec/renderer/$1',
    '\\.css$': '<rootDir>/spec/renderer/stubs/CssStub.ts',
    '@fontsource/montserrat': '<rootDir>/spec/renderer/stubs/CssStub.ts'
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
  setupFiles: ['<rootDir>/spec/renderer/setup.ts']
}
