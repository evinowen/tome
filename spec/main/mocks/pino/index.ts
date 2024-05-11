/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals'

export interface Logger {
  info: any
  error: any
  warn: any
  debug: any
}

const pino = jest.fn(() => {
  return {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  } as Logger
})

const transport_object = {
  on: jest.fn((event, callback: () => void) => {
    callback()
  }),
}

Object.assign(pino, {
  transport: jest.fn(() => {
    return transport_object
  }),
})

export default pino
