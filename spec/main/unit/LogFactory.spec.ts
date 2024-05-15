import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import LogFactory, { Logger, CreateDirectoryFailure, CreateLogFileFailure } from '@/LogFactory'
import * as node_fs from 'node:fs'

jest.mock('node:fs', () => ({
  WriteStream: class {
    write = jest.fn()
    // eslint-disable-next-line unicorn/consistent-function-scoping
    end = jest.fn((callback: () => void) => callback())
  },
  promises: {
    access: jest.fn(() => Promise.resolve()),
    mkdir: jest.fn(() => Promise.resolve()),
  },
  createWriteStream: jest.fn(),
}))

jest.mock('node:path', () => ({
  dirname: jest.fn((path: string) => path.slice(0, path.lastIndexOf('/'))),
}))

const mocked_node_fs = jest.mocked(node_fs)
mocked_node_fs.createWriteStream.mockImplementation(() => new mocked_node_fs.WriteStream())

describe('LogFactory', () => {
  beforeEach(() => {})

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create application Logger upon to call to build static method', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    expect(logger).not.toBeUndefined()
  })

  it('should not create directory for logs when directory node:fs.promises.access succeeds', async () => {
    mocked_node_fs.promises.access.mockImplementationOnce(() => Promise.resolve())

    const path = '/project/logs'
    await LogFactory.build(path)

    expect(mocked_node_fs.promises.mkdir).not.toHaveBeenCalled()
  })

  it('should create directory for logs when directory node:fs.promises.access fails', async () => {
    mocked_node_fs.promises.access.mockImplementationOnce(() => Promise.reject())

    const path = '/project/logs'
    await expect(LogFactory.build(path)).resolves.toBeInstanceOf(Logger)

    expect(mocked_node_fs.promises.mkdir).toHaveBeenCalledWith('/project')
  })

  it('should throw a CreateDirectoryFailure error if node:fs.mkdir throws an error', async () => {
    mocked_node_fs.promises.access.mockImplementationOnce(() => Promise.reject())
    mocked_node_fs.promises.mkdir.mockImplementationOnce(() => Promise.reject())

    const path = '/project/logs'
    await expect(LogFactory.build(path)).rejects.toThrowError(CreateDirectoryFailure)
  })

  it('should throw a CreateLogFileFailure error if node:fs.createWriteStream throws an error', async () => {
    mocked_node_fs.createWriteStream.mockImplementationOnce(() => {
      throw new Error('Error Message')
    })

    const path = '/project/logs'
    await expect(LogFactory.build(path)).rejects.toThrowError(CreateLogFileFailure)
  })

  it('should call Logger.log method with provided parameters upon call to Logger.trace', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    const spy_log = jest.spyOn(logger, 'log')
    spy_log.mockImplementation(() => {})

    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    logger.trace(message, ...context)
    expect(spy_log).toHaveBeenCalledWith('trace', message, context)

    spy_log.mockRestore()
  })

  it('should call Logger.log method with provided parameters upon call to Logger.debug', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    const spy_log = jest.spyOn(logger, 'log')
    spy_log.mockImplementation(() => {})

    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    logger.debug(message, ...context)
    expect(spy_log).toHaveBeenCalledWith('debug', message, context)

    spy_log.mockRestore()
  })

  it('should call Logger.log method with provided parameters upon call to Logger.info', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    const spy_log = jest.spyOn(logger, 'log')
    spy_log.mockImplementation(() => {})

    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    logger.info(message, ...context)
    expect(spy_log).toHaveBeenCalledWith('info', message, context)

    spy_log.mockRestore()
  })

  it('should call Logger.log method with provided parameters upon call to Logger.warn', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    const spy_log = jest.spyOn(logger, 'log')
    spy_log.mockImplementation(() => {})

    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    logger.warn(message, ...context)
    expect(spy_log).toHaveBeenCalledWith('warn', message, context)

    spy_log.mockRestore()
  })

  it('should call Logger.log method with provided parameters upon call to Logger.error', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    const spy_log = jest.spyOn(logger, 'log')
    spy_log.mockImplementation(() => {})

    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    logger.error(message, ...context)
    expect(spy_log).toHaveBeenCalledWith('error', message, context)

    spy_log.mockRestore()
  })

  it('should call Logger.log method with provided parameters upon call to Logger.fault', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    const spy_log = jest.spyOn(logger, 'log')
    spy_log.mockImplementation(() => {})

    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    logger.fault(message, ...context)
    expect(spy_log).toHaveBeenCalledWith('fault', message, context)

    spy_log.mockRestore()
  })

  it('should call Logger.log method with provided parameters upon call to Logger.fault', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    const spy_log = jest.spyOn(logger, 'log')
    spy_log.mockImplementation(() => {})

    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    logger.fault(message, ...context)
    expect(spy_log).toHaveBeenCalledWith('fault', message, context)

    spy_log.mockRestore()
  })

  it('should call Logger.message method with provided parameters upon call to Logger.log when Logger.level is then than or equal to log level', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)
    logger.level = 'trace'

    const spy_message = jest.spyOn(Logger, 'message')
    spy_message.mockImplementation(() => {})

    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    logger.log('trace', message, context)
    expect(spy_message).toHaveBeenCalledWith(logger.stream, 'trace', message, context)

    spy_message.mockRestore()
  })

  it('should call Logger.message method with provided parameters upon call to Logger.log when Logger.level is greater than log level', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)
    logger.level = 'info'

    const spy_message = jest.spyOn(Logger, 'message')
    spy_message.mockImplementation(() => {})

    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    logger.log('trace', message, context)
    expect(spy_message).not.toHaveBeenCalled()

    spy_message.mockRestore()
  })

  it('should call Logger.write upon call to Logger.message', async () => {
    const spy_write = jest.spyOn(Logger, 'write')
    spy_write.mockImplementation(() => {})

    const stream = new mocked_node_fs.WriteStream()
    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    Logger.message(stream, 'trace', message, context)
    expect(spy_write).toHaveBeenCalled()

    spy_write.mockRestore()
  })

  it('should call Logger.console upon call to Logger.message', async () => {
    const spy_console = jest.spyOn(Logger, 'console')
    spy_console.mockImplementation(() => {})

    const stream = new mocked_node_fs.WriteStream()
    const message = 'Test Message'
    const context = [
      'Context String',
      1000,
    ]

    Logger.message(stream, 'trace', message, context)
    expect(spy_console).toHaveBeenCalled()

    spy_console.mockRestore()
  })

  it('should call node_fs.WriteStream.end upon call to Logger.flush', async () => {
    const path = '/project/logs'
    const logger = await LogFactory.build(path)

    const spy_stream_end = jest.spyOn(logger.stream, 'end')

    await expect(logger.flush()).resolves
    expect(spy_stream_end).toHaveBeenCalled()

    spy_stream_end.mockRestore()
  })
})
