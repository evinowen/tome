const path = {
  basename: jest.fn(target => (target || '').slice(target.lastIndexOf('/') + 1)),
  dirname: jest.fn(target => target.slice(0, target.lastIndexOf('/'))),
  extname: jest.fn(target => target.slice(target.lastIndexOf('.'))),
  join: jest.fn((...targets) => targets.join('/')),
  parse: jest.fn(target => ({ name: path.basename(target), ext: path.extname(target) })),
  relative: jest.fn((base, target) => target.slice(target.lastIndexOf(base) + base.length)),
  sep: '/'
}

module.exports = path
