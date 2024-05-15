import * as node_path from 'node:path'
import * as node_fs from 'node:fs'

export class CreateDirectoryFailure extends Error {}
export class CreateLogFileFailure extends Error {}

const LoggerLevels = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fault: 5,
}

type LoggerLevel = keyof typeof LoggerLevels

const LoggerPrintColors = {
  trace: '\u001B[90m', // Grey
  debug: '\u001B[34m', // Blue
  info: '\u001B[32m', // Green
  warn: '\u001B[33m', // Yellow
  error: '\u001B[31m', // Red
  fault: '\u001B[41m\u001B[30m', // White on Red
}

const LoggerPrintLabels = {
  trace: 'TRACE',
  debug: 'DEBUG',
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
  fault: 'FATAL',
}

export class Logger {
  level: LoggerLevel
  stream: node_fs.WriteStream

  trace (message, ...context) {
    this.log('trace', message, context)
  }

  debug (message, ...context) {
    this.log('debug', message, context)
  }

  info (message, ...context) {
    this.log('info', message, context)
  }

  warn (message, ...context) {
    this.log('warn', message, context)
  }

  error (message, ...context) {
    this.log('error', message, context)
  }

  fault (message, ...context) {
    this.log('fault', message, context)
  }

  log (level: LoggerLevel, message, context) {
    if (LoggerLevels[this.level] <= LoggerLevels[level]) {
      Logger.message(this.stream, level, message, context)
    }
  }

  async flush () {
    return new Promise<void>((resolve) => {
      this.stream.end(() => resolve())
    })
  }

  static message (stream: node_fs.WriteStream, level: LoggerLevel, message: string, context: any[]) {
    const time = Date.now()

    Logger.write(stream, {
      level,
      time,
      message,
      context,
    })

    Logger.console(time, level, message, context)
  }

  static console (time, level: LoggerLevel, message, context) {
    const color = LoggerPrintColors[level]
    const label = LoggerPrintLabels[level]

    const data = [
      '\u001B[2m', time, ' ',
      '\u001B[0m\u001B[1m', color, label, '\u001B[0m', ' ',
      '\u001B[0m', message, ' ',
      '\u001B[2m', JSON.stringify(context),
      '\u001B[0m',
    ]
    console.log(data.join(''))
  }

  static write (stream: node_fs.WriteStream, payload) {
    const data = JSON.stringify(payload)
    stream.write(`${data}\n`)
  }
}

export default class LogFactory {
  static async build (path): Promise<Logger> {
    {
      const directory = node_path.dirname(path)
      try {
        await node_fs.promises.access(directory)
      } catch {
        try {
          await node_fs.promises.mkdir(directory)
        } catch {
          throw new CreateDirectoryFailure()
        }
      }
    }

    try {
      const stream = node_fs.createWriteStream(path)

      const logger = new Logger()
      logger.level = 'info'
      logger.stream = stream

      return logger
    } catch {
      throw new CreateLogFileFailure()
    }
  }
}
