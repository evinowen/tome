import invoker from '../invoke'

const invoke = invoker('path')

export default {
  basename: invoke('basename'),
  dirname: invoke('dirname'),
  extension: invoke('extension'),
  join: (...targets) => invoke('join')(targets),
  relative: invoke('relative'),
  sep: invoke('sep')
}
