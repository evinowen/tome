const fs = require('fs')

const callback_with_reject = (resolve, reject) => (error, ...values) => error ? reject(error) : resolve(...values)
const callback_with_boolean = (resolve) => (error) => error ? resolve(false) : resolve(true)

const library = {
  promise_with_reject: (callable) => (...input) => new Promise((resolve, reject) => callable(...input, callback_with_reject(resolve, reject))),
  promise_with_boolean: (callable) => (...input) => new Promise((resolve, reject) => callable(...input, callback_with_boolean(resolve))),
  promise_access: (target) => library.promise_with_boolean(fs.access)(target),
}

module.exports = library
