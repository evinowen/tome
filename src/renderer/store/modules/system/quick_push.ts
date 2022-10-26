import { delay } from 'lodash'

export default class QuickPush {
  static async perform (dispatch: (action: string, data?: unknown) => Promise<boolean>) {
    await dispatch('message', 'Perform Quick Push')

    await dispatch('system/edit', true)
    await dispatch('system/push', true)
    await dispatch('system/push_confirm', true)

    await new Promise((resolve) => delay(resolve, 500))

    await dispatch('system/perform', 'push')
  }
}
