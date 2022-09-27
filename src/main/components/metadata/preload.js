const invoke = require('../invoke')('app')

module.exports = {
  app_getPath: invoke('getPath'),
  app_getVersion: invoke('getVersion'),
  app_getProcess: invoke('getProcess')
}
