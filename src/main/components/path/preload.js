const invoke = require('../invoke')('path')

module.exports = {
  path_basename: invoke('basename'),
  path_dirname: invoke('dirname'),
  path_extension: invoke('extension'),
  path_join: (...targets) => invoke('join')(targets),
  path_relative: invoke('relative'),
  path_sep: invoke('sep')
}
