import { delay } from 'lodash'

export default class Push {
  static async perform (dispatch: (action: string, data?: unknown) => Promise<boolean>) {
    await dispatch('log', { level: 'info', message: 'Perform Push' })

    await dispatch('repository/push')

    await new Promise((resolve) => delay(resolve, 500))

    await dispatch('system/push_confirm', false)
    await dispatch('system/push', false)
  }
}
