import pino, { Logger } from 'pino'
export { Logger } from 'pino'

export default class LogFactory {
  static build (path): Promise<Logger> {
    return new Promise((resolve) => {
      const transport = pino.transport({
        targets: [
          {
            target: 'pino/file',
            level: 'trace',
            options: {
              destination: path,
              mkdir: true,
            },
          },
          {
            target: 'pino-pretty',
            level: 'trace',
            options: {
              destination: 1,
            },
          },
        ],
      })

      const logger = pino(transport)

      transport.on('ready', () => resolve(logger))
    })
  }
}
