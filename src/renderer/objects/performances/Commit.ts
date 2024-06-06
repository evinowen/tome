import { delay } from 'lodash'
import { fetch_log_store } from '@/store/log'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import { fetch_repository_committer_signature_store } from '@/store/modules/repository/committer/signature'

export default class Commit {
  static async perform () {
    const log = fetch_log_store()
    const system = fetch_system_store()
    const repository_committer = fetch_repository_committer_store()
    const repository_committer_signature = fetch_repository_committer_signature_store()

    await log.info('Perform Commit')

    try {
      if (repository_committer.status.staged.length === 0) {
        await log.info('Commit has no changes staged')
        return
      }

      await repository_committer.commit()
      await repository_committer_signature.sign_message()

      await log.info('Commit done')
    } catch {
      await log.error('Commit failed')
      return
    } finally {
      await system.page({ commit_confirm: false })
      await system.page({ commit: false })
    }

    if (system.commit_push) {
      await new Promise((resolve) => delay(resolve, 100))

      await system.perform(SystemPerformance.QuickPush)
    }

    await new Promise((resolve) => delay(resolve, 200))
  }
}
