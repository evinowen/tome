import component from '@/objects/ComponentFactory'

export default component('log')(
  ({ on, log }) => {
    on('configure', (level) => log.level = level)

    on('trace', (message) => log.trace(message))
    on('debug', (message) => log.debug(message))
    on('info', (message) => log.info(message))
    on('warn', (message) => log.warn(message))
    on('error', (message) => log.error(message))
    on('fatal', (message) => log.fatal(message))
  },
)
