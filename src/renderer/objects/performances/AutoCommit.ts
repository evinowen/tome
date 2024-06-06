import { delay } from 'lodash'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import { fetch_repository_committer_signature_store } from '@/store/modules/repository/committer/signature'

export default class AutoCommit {
  static async perform () {
    const configuration = fetch_configuration_store()
    const log = fetch_log_store()
    const system = fetch_system_store()

    const repository_committer = fetch_repository_committer_store()
    const repository_committer_signature = fetch_repository_committer_signature_store()

    await log.info('Perform Auto Commit')

    try {
      await system.page({ commit_push: configuration.active.auto_push })

      await repository_committer.inspect()
      await repository_committer.stage('*')

      await repository_committer_signature.sign_name()
      await repository_committer_signature.sign_email()
      await repository_committer_signature.sign_message()

      if (!await repository_committer_signature.check()) {
        await log.error('Auto Commit cannot complete without valid signature')
        return
      }

      await system.perform(SystemPerformance.Commit)
    } catch {
      await log.error('Auto Commit failed')
      return
    }

    await new Promise((resolve) => delay(resolve, 200))
  }
}
