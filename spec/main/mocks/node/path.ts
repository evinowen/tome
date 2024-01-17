import { jest } from '@jest/globals'

export const basename = jest.fn((target: string) => (target || '').slice(target.lastIndexOf('/') + 1))
export const dirname = jest.fn((target: string) => target.slice(0, target.lastIndexOf('/')))
export const extname = jest.fn((target: string) => target.slice(target.lastIndexOf('.')))
export const join = jest.fn((...targets: string[]) => targets.join('/'))
export const parse = jest.fn((target: string) => ({ name: basename(target), ext: extname(target) }))
export const relative = jest.fn((base: string, target: string) => target.slice(target.lastIndexOf(base) + base.length))
// eslint-disable-next-line unicorn/prevent-abbreviations
export const sep = '/'
