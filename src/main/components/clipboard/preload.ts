import invoker from '../invoke'

const invoke = invoker('clipboard')

export default {
  writetext: invoke('writetext'),
  readtext: invoke('readtext'),
  paste: invoke('paste')
}
