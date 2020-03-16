module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!**/node_modules/**'
  ],
  coverageDirectory: './reports/coverage',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports/junit/jest'
      }
    ]
  ]
}
