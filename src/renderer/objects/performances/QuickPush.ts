import { delay } from 'lodash'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'

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

    await system.perform(SystemPerformance.Push)
  }
}
