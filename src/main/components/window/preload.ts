import invoker from '../invoke'

const invoke = invoker('window')

export default {
  is_maximized: invoke('is-maximized'),
  restore: invoke('restore'),
  maximize: invoke('maximize'),
  minimize: invoke('minimize'),
  close: invoke('close')
}
