import { delay } from 'lodash'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'

export default class QuickPush {
  static async perform () {
    const log = fetch_log_store()
    const system = fetch_system_store()

    await log.info('Perform Quick Push')

    await system.page({
      edit: true,
      push: true,
      push_confirm: true,
    })

    await new Promise((resolve) => delay(resolve, 500))

    const repository_remotes = fetch_repository_remotes_store()
    await repository_remotes.load()

    try {
      const configuration = fetch_configuration_store()
      await repository_remotes.select(configuration.active.default_remote)
    } catch (error) {
      log.error('Error connecting to default remote', error)
      return
    }

    await system.perform(SystemPerformance.Push)
  }
}
