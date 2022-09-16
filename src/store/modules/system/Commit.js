import { delay } from 'lodash'

export default class Commit {
  static async perform (dispatch) {
    await dispatch('message', 'Perform Commit')

    try {
      await dispatch('tome/commit')
      await dispatch('tome/signature/message')

      await dispatch('message', 'Commit done')
    } catch (error) {
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
