import path from 'path'
import { defineConfig, mergeConfig } from 'vitest/config'
import config from '../../src/renderer/vite.config.js'

export default mergeConfig(config, defineConfig({
  resolve: {
    alias: {
      '?': path.resolve('spec/renderer'),
    },
  },
  test: {
    environment: 'happy-dom',
    coverage: {
      all: true,
      enabled: true,
      provider: 'istanbul',
      reporter: 'html',
      reportsDirectory: '../../reports/renderer/coverage',
      thresholds: {
        branches: 60,
        functions: 80,
        lines: 80,
        statements: 80,
      }
    },
    deps: {
      inline: ['vuetify']
    },
    outputFile: '../../reports/renderer/results.json'
  }
}))
