const invoke = require('../invoke')('window')

module.exports = {
  is_window_maximized: invoke('is-maximized'),
  restore_window: invoke('restore'),
  maximize_window: invoke('maximize'),
  minimize_window: invoke('minimize'),
  close_window: invoke('close')
}
