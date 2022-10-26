
export const basename = jest.fn(target => (target || '').slice(target.lastIndexOf('/') + 1))
export const dirname = jest.fn(target => target.slice(0, target.lastIndexOf('/')))
export const extname = jest.fn(target => target.slice(target.lastIndexOf('.')))
export const join = jest.fn((...targets) => targets.join('/'))
export const parse = jest.fn(target => ({ name: basename(target), ext: extname(target) }))
export const relative = jest.fn((base, target) => target.slice(target.lastIndexOf(base) + base.length))
// eslint-disable-next-line unicorn/prevent-abbreviations
export const sep = '/'
