const invoke = require('../invoke')('ssl')

module.exports = {
  ssl: {
    generate_public_key: invoke('generate-public-key'),
    generate_private_key: invoke('generate-private-key')
  }
}
