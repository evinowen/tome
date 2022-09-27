const invoke = require('../invoke')('app')

module.exports = {
  app: {
    getPath: invoke('getPath'),
    getVersion: invoke('getVersion'),
    getProcess: invoke('getProcess')
  }
}
