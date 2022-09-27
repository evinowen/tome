const invoke = require('../invoke')('clipboard')

module.exports = {
  clipboard_writetext: invoke('writetext'),
  clipboard_readtext: invoke('readtext'),
  clipboard_paste: invoke('paste')
}
