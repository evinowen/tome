import { delay } from 'lodash'

export default class QuickCommit {
  static async perform (dispatch: (action: string, data?: unknown) => Promise<boolean>) {
    await dispatch('log', { level: 'info', message: 'Perform Quick Commit' })

    try {
      await dispatch('system/edit', true)
      await dispatch('system/commit', true)

      await dispatch('repository/stage', '*')
      if (!await dispatch('system/commit_confirm', true)) {
        await dispatch('error/show', {
          title: 'Quick Commit Error: Signature',
          message: 'Incomplete commit signature, missing valid Name or E-Mail address.',
          help: 'quick-commit-error-signature',
        })
        return
      }

      const push = await dispatch('configuration/read', 'auto_push')
      await dispatch('system/commit_push', push)

      await new Promise((resolve) => delay(resolve, 500))

      await dispatch('repository/stage', '*')
      await dispatch('system/perform', 'commit')
    } catch {
      await dispatch('log', { level: 'error', message: 'Quick Commit failed' })
      return
    }

    await new Promise((resolve) => delay(resolve, 200))
  }
}
