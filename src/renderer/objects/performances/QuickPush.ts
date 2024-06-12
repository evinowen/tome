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
    })

    await new Promise((resolve) => delay(resolve, 500))

    const repository_remotes = fetch_repository_remotes_store()
    await repository_remotes.load()

    const configuration = fetch_configuration_store()
    await repository_remotes.select(configuration.active.default_remote)

    if (repository_remotes.error) {
      log.error(repository_remotes.error)
      return false
    }

    await system.page({ push_confirm: true })

    const push_success = await system.perform(SystemPerformance.Push)
    if (!push_success) {
      return false
    }

    await new Promise((resolve) => delay(resolve, 500))

    await system.page({ push_confirm: false })
    await system.page({ push: false })

    return true
  }
}
