const baseline = {
  canceled: false,
  filePaths: [
    '/project'
  ]
}

const result = {}
Object.assign(result, baseline)

export default {
  result_dialog: () => result,
  reset_dialog: () => {
    Object.assign(result, baseline)
  },
  trip_canceled_dialog: () => {
    result.canceled = true
  },
  trip_empty_dialog: () => {
    result.filePaths.length = 0
  }
}
