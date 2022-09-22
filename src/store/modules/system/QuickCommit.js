import { delay } from 'lodash'

export default class QuickCommit {
  static async perform (dispatch) {
    await dispatch('message', 'Perform Quick Commit')

    try {
      await dispatch('system/edit', true)
      await dispatch('system/commit', true)
      await dispatch('system/commit_confirm', true)

      const push = await dispatch('configuration/read', 'auto_push')
      await dispatch('system/commit_push', push)

      await new Promise((resolve) => delay(resolve, 500))

      await dispatch('tome/stage', '*')
      await dispatch('system/perform', 'commit')
    } catch (error) {
      await dispatch('error', 'Quick Commit failed')
      return
    }

    await new Promise((resolve) => delay(resolve, 200))
  }
}