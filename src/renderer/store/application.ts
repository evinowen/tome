import { defineStore } from 'pinia'
import api from '@/api'

import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_log_store } from '@/store/log'
import { fetch_library_store } from '@/store/modules/library'
import { fetch_system_store } from '@/store/modules/system'

export { File } from './modules/files'

export interface State {
  stages?: ApplicationStage[]
  application_path?: string
  configuration_path?: string
  library_path?: string
}

export enum ApplicationStage {
  Application = 'application',
  Fonts = 'fonts',
}

export const StateDefaults = (): State => ({
  stages: [],
  application_path: '',
  configuration_path: '',
  library_path: '',
})

export const fetch_application_store = defineStore('application', {
  state: StateDefaults,
  actions: {
    hydrate: async function () {
      const configuration = fetch_configuration_store()
      const log = fetch_log_store()
      const library = fetch_library_store()
      const system = fetch_system_store()

      await log.trace('Loading...')

      this.application_path = await api.app.getPath('userData')
      this.configuration_path = await api.path.join(this.application_path, 'config.json')
      this.library_path = await api.path.join(this.application_path, 'library.json')

      await system.load()

      await configuration.load()

      await log.debug(`Library established at ${this.library_path}`)
      await library.load(this.library_path)

      await log.debug('Loading all Fonts')
      for (const fontface of document.fonts) {
        await fontface.load()
      }

      await this.present(ApplicationStage.Fonts)

      await log.info('Welcome to Tome')
    },
    present: async function (stage: ApplicationStage) {
      this.stages.push(stage)

      if (!this.stages.includes(ApplicationStage.Application)) {
        return
      }

      if (!this.stages.includes(ApplicationStage.Fonts)) {
        return
      }

      api.initalize.ready()
    },
  },
})
