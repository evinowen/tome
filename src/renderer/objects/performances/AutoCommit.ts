import { delay } from 'lodash'

export default class AutoCommit {
  static async perform (dispatch: (action: string, data?: unknown) => Promise<boolean>) {
    await dispatch('log', { level: 'info', message: 'Perform Auto Commit' })

    try {
      const push = await dispatch('configuration/read', 'auto_push')
      await dispatch('system/commit_push', push)

      await dispatch('repository/inspect')
      await dispatch('repository/stage', '*')

      await dispatch('repository/signature/name')
      await dispatch('repository/signature/email')
      await dispatch('repository/signature/message')

      if (!await dispatch('repository/signature/check')) {
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
