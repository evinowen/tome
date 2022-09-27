const invoke = require('../invoke')('ssl')

module.exports = {
  ssl_generate_public_key: invoke('generate-public-key'),
  ssl_generate_private_key: invoke('generate-private-key')
}
