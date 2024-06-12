import { defineStore } from 'pinia'
import { DateTime } from 'luxon'
import api from '@/api'
import { fetch_configuration_store } from '@/store/modules/configuration'

enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Fatal = 'fatal',
}

const LogLevelOrder = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
]

export interface LogEvent {
  level: LogLevel
  message: string
  stack?: string
  datetime: DateTime
}

export interface State {
  events?: LogEvent[]
}

export const StateDefaults = (): State => ({
  events: [],
})

const Log = (store, level, message, stack = '') => {
  const configuration = fetch_configuration_store()
  const threshold = LogLevelOrder.indexOf(configuration.active.log_level || LogLevel.Info)
  const priority = LogLevelOrder.indexOf(level)

  if (priority < threshold) {
    return false
  }

  store.events.push({
    level,
    message,
    stack,
    datetime: DateTime.now(),
  })

  return true
}

export const fetch_log_store = defineStore('log', {
  state: StateDefaults,
  getters: {
    status: (state) => state.events.length === 0 ? '' : state.events.at(-1).level,
    message: (state) => state.events.length === 0 ? '' : state.events.at(-1).message,
  },
  actions: {
    trace: function (message, stack?) {
      if (Log(this, LogLevel.Trace, message, stack)) {
        api.log.trace(message)
      }
    },
    debug: function (message, stack?) {
      if (Log(this, LogLevel.Debug, message, stack)) {
        api.log.debug(message)
      }
    },
    info: function (message, stack?) {
      if (Log(this, LogLevel.Info, message, stack)) {
        api.log.info(message)
      }
    },
    warn: function (message, stack?) {
      if (Log(this, LogLevel.Warn, message, stack)) {
        api.log.warn(message)
      }
    },
    error: function (message, stack?) {
      if (Log(this, LogLevel.Error, message, stack)) {
        api.log.error(message)
      }
    },
    fatal: function (message, stack?) {
      if (Log(this, LogLevel.Fatal, message, stack)) {
        api.log.fatal(message)
      }
    },
  },
})
