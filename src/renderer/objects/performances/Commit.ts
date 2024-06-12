import { fetch_log_store } from '@/store/modules/log'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'

export default class Commit {
  static async perform () {
    const log = fetch_log_store()
    const repository_committer = fetch_repository_committer_store()

    const count = repository_committer.status.staged.length
    if (count === 0) {
      await log.info('Commit has no changes staged')
      return false
    }

    try {
      await log.info(`Perform Commit from ${count} staged change${count === 1 ? '' : 's'}...`)

      await repository_committer.commit()

      await log.info('Commit Complete')
    } catch {
      await log.error('Commit Failed')
      return false
    }

    return true
  }
}
