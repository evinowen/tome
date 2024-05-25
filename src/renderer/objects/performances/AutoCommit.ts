import { delay } from 'lodash'

export default class AutoCommit {
  static async perform (dispatch: (action: string, data?: unknown) => Promise<boolean>) {
    await dispatch('log', { level: 'info', message: 'Perform Auto Commit' })

    try {
      const push = await dispatch('configuration/read', 'auto_push')
      await dispatch('system/commit_push', push)

      await dispatch('repository/committer/inspect')
      await dispatch('repository/committer/stage', '*')

      await dispatch('repository/committer/signature/name')
      await dispatch('repository/committer/signature/email')
      await dispatch('repository/committer/signature/message')

      if (!await dispatch('repository/committer/signature/check')) {
        await dispatch('log', { level: 'error', message: 'Auto Commit cannot complete without valid signature' })
        return
      }

      await dispatch('system/perform', 'commit')
    } catch {
      await dispatch('log', { level: 'error', message: 'Auto Commit failed' })
      return
    }

    await new Promise((resolve) => delay(resolve, 200))
  }
}
