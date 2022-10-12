import { delay } from 'lodash'

export default class Commit {
  static async perform (dispatch: (action: string, data?: unknown) => Promise<boolean>) {
    await dispatch('message', 'Perform Commit')

    try {
      await dispatch('repository/commit')
      await dispatch('repository/signature/message')

      await dispatch('message', 'Commit done')
    } catch {
      await dispatch('error', 'Commit failed')
      return
    } finally {
      await dispatch('system/commit_confirm', false)
      await dispatch('system/commit', false)
    }

    if (await dispatch('system/commit_push')) {
      await new Promise((resolve) => delay(resolve, 100))

      await dispatch('system/perform', 'quick-push')
    }

    await new Promise((resolve) => delay(resolve, 200))
  }
}
