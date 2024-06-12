import { fetch_log_store } from '@/store/modules/log'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'

export default class Push {
  static async perform () {
    const log = fetch_log_store()
    const repository_remotes = fetch_repository_remotes_store()

    const count = repository_remotes.active.pending.length

    if (count <= 0) {
      await log.info('Push has no pending commits')
      return false
    }

    try {
      await log.info(`Perform Push for ${count} commit${count === 1 ? '' : 's'}...`)

      await repository_remotes.push()

      await log.info('Push Complete')
    } catch {
      await log.error('Push Failed')
      return false
    }

    return true
  }
}
