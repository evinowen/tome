const invoke = require('../invoke')('path')

module.exports = {
  path: {
    basename: invoke('basename'),
    dirname: invoke('dirname'),
    extension: invoke('extension'),
    join: (...targets) => invoke('join')(targets),
    relative: invoke('relative'),
    sep: invoke('sep')
  }
}
