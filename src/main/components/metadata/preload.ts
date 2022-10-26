import invoker from '../invoke'

const invoke = invoker('app')

export default {
  getPath: invoke('getPath'),
  getVersion: invoke('getVersion'),
  getProcess: invoke('getProcess')
}
