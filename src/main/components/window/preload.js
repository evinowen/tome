const invoke = require('../invoke')('window')

module.exports = {
  window: {
    is_maximized: invoke('is-maximized'),
    restore: invoke('restore'),
    maximize: invoke('maximize'),
    minimize: invoke('minimize'),
    close: invoke('close')
  }
}
