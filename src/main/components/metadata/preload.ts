import invoker from '../invoke'

const invoke = invoker('app')

export = {
  getPath: invoke('getPath'),
  getVersion: invoke('getVersion'),
  getProcess: invoke('getProcess')
}
