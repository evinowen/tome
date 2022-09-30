const invoke = require('../invoke')('clipboard')

module.exports = {
  clipboard: {
    writetext: invoke('writetext'),
    readtext: invoke('readtext'),
    paste: invoke('paste')
  }
}
