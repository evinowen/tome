import { delay } from 'lodash'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'

export default class Push {
  static async perform () {
    const log = fetch_log_store()
    const system = fetch_system_store()
    const repository_remotes = fetch_repository_remotes_store()

    await log.info('Perform Push')

    await repository_remotes.push()

    await new Promise((resolve) => delay(resolve, 500))

    await system.page({ push_confirm: false })
    await system.page({ push: false })
  }
}
