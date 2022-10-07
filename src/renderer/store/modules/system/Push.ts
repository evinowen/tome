import { delay } from 'lodash'

export default class Push {
  static async perform (dispatch: (action: string, data?: any) => Promise<boolean>) {
    await dispatch('message', 'Perform Push')

    await dispatch('repository/push')

    await new Promise((resolve) => delay(resolve, 500))

    await dispatch('system/push_confirm', false)
    await dispatch('system/push', false)
  }
}
