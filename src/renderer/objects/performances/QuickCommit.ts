import { delay } from 'lodash'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_log_store } from '@/store/log'
import { fetch_error_store } from '@/store/modules/error'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import { fetch_repository_committer_signature_store } from '@/store/modules/repository/committer/signature'

export default class QuickCommit {
  static async perform () {
    const configuration = fetch_configuration_store()
    const log = fetch_log_store()
    const error = fetch_error_store()
    const system = fetch_system_store()
    const repository_committer = fetch_repository_committer_store()
    const repository_committer_signature = fetch_repository_committer_signature_store()

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

      if (!await repository_committer_signature.check()) {
        await error.show(
          'Quick Commit Error: Signature',
          'Incomplete commit signature, missing valid Name or E-Mail address.',
          'quick-commit-error-signature',
        )
        return
      }

      await repository_committer.stage('*')
      await system.page({ commit_confirm: true })

      await system.page({ commit_push: configuration.auto_push })

      await new Promise((resolve) => delay(resolve, 500))

      await system.perform(SystemPerformance.Commit)
    } catch {
      await log.error('Quick Commit failed')
      return
    }

    await new Promise((resolve) => delay(resolve, 200))
  }
}
