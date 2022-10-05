import invoker from '../invoke'

const invoke = invoker('clipboard')

export = {
  writetext: invoke('writetext'),
  readtext: invoke('readtext'),
  paste: invoke('paste')
}
