module.exports = {
  rootDir: '../..',
  preset: 'ts-jest',
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
    "^.+\\.[tj]s$": "ts-jest",
    "^.+\\.vue$": "@vue/vue2-jest"
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/renderer/**/*.{ts,js,vue}',
    '!<rootDir>/src/renderer/**/*.d.ts'
  ],
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
    '^vuetify/lib$': 'vuetify/es5/entry-lib',
    '^vuetify/lib/(.*)': 'vuetify/es5/$1',
    '\\.png$': '<rootDir>/spec/renderer/stubs/FileStub.ts',
    '\\.(css|less|scss|sass)$': '<rootDir>/spec/renderer/stubs/CssStub.ts',
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
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/spec/renderer/setup.ts']
}
