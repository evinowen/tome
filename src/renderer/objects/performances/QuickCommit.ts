import { delay } from 'lodash'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import CommitError from '@/objects/errors/CommitError'

export default class QuickCommit {
  static async perform () {
    const configuration = fetch_configuration_store()
    const log = fetch_log_store()
    const system = fetch_system_store()
    const repository_committer = fetch_repository_committer_store()

    await log.info('Perform Quick Commit')

    try {
      await system.page({
        console: false,
        push: false,
        settings: false,
      })

      await system.page({
        edit: true,
        commit: true,
      })

      await repository_committer.stage('*')
      await repository_committer.compose(undefined, true)

      if (await CommitError()) {
        return false
      }

      await system.page({ commit_confirm: true })

      await new Promise((resolve) => delay(resolve, 500))

      const commit_success = await system.perform(SystemPerformance.Commit)
      if (!commit_success) {
        return false
      }

      await new Promise((resolve) => delay(resolve, 500))

      await system.page({ commit_confirm: false })
      await system.page({
        edit: false,
        commit: false,
      })

      await new Promise((resolve) => delay(resolve, 200))

      if (configuration.active.auto_push) {
        const push_success = await system.perform(SystemPerformance.QuickPush)
        if (!push_success) {
          return false
        }
      }
    } catch {
      await log.error('Quick Commit failed')
      return false
    }

    await new Promise((resolve) => delay(resolve, 200))
    return true
  }
}
