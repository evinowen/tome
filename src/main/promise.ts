import * as fs from 'fs'

const callback_with_reject = (resolve, reject) => (error, ...values) => error ? reject(error) : resolve(...values)
const callback_with_boolean = (resolve) => (error) => error ? resolve(false) : resolve(true)

export function promise_with_reject<T> (callable) {
  return (...input) => new Promise<T>((resolve, reject) => callable(...input, callback_with_reject(resolve, reject)))
}

export function promise_with_boolean<T> (callable) {
  return (...input) => new Promise<T>((resolve) => callable(...input, callback_with_boolean(resolve)))
}

export function promise_access<T> (target) {
  return promise_with_boolean<T>(fs.access)(target)
}
