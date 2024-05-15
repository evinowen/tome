import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import LogFactory from '@/LogFactory'

jest.mock('node:fs', () => ({
  WriteStream: class {},
  promises: {
    access: jest.fn(() => Promise.resolve()),
    mkdir: jest.fn(() => Promise.resolve()),
  },
  createWriteStream: jest.fn(),
}))

jest.mock('node:path', () => ({
  dirname: jest.fn(() => '/path'),
}))

describe('LogFactory', () => {
  beforeEach(() => {})

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should create application Logger upon to call to build static method', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    expect(logger).not.toBeUndefined()
  })
})
