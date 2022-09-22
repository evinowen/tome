const { cloneDeep } = require('lodash')
const electron = require('electron')
const path = require('path')
const { random_string, expect_call_parameters_to_return } = require('@/../spec/helpers')(expect)
const _component = require('@/../electron/components/path')
const preload = require('@/../electron/components/path/preload')

let ipcMainMap

jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('path', () => ({
  basename: jest.fn(),
  dirname: jest.fn(),
  extname: jest.fn(),
  parse: jest.fn(),
  join: jest.fn(),
  relative: jest.fn(),
  sep: 'separator'
}))

path.basename.mockImplementation(() => random_string(16, true))
path.dirname.mockImplementation(() => random_string(16, true))
path.extname.mockImplementation(() => random_string(16, true))
path.parse.mockImplementation(() => ({ name: random_string(), ext: random_string() }))
path.join.mockImplementation((...input) => input.join('/'))
path.relative.mockImplementation(() => random_string(16, true))

describe('PathComponent', () => {
  let component
  let win

  beforeEach(() => {
    ipcMainMap = new Map()

    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call for and return basename of target upon call to path_basename', async () => {
    const target = '/project'
    const result = await preload.path_basename(target)

    expect_call_parameters_to_return(path.basename, [target], result)
  })

  it('should call for and return dirname of target upon call to path_basename', async () => {
    const target = '/project'
    const result = await preload.path_dirname(target)

    expect_call_parameters_to_return(path.dirname, [target], result)
  })

  it('should call for and return lower case extension of target upon call to path_extension', async () => {
    const target = '/project/FILE.MD'
    const result = await preload.path_extension(target)

    expect_call_parameters_to_return(path.extname, [target], result.toLowerCase())
  })

  it('should return undefined if extension cannot be identified upon call to path_extension', async () => {
    path.extname.mockImplementationOnce(() => '')

    const target = '/project/FILE.MD'
    await preload.path_extension(target)

    expect_call_parameters_to_return(path.extname, [target], undefined)
  })

  it('should call for and return joined path upon call to path_join', async () => {
    const dirname = '/project'
    const basename = 'FILE.MD'
    const result = await preload.path_join(dirname, basename)

    expect_call_parameters_to_return(path.join, [dirname, basename], result)
  })

  it('should call for and return relative path upon call to path_relative', async () => {
    const target = '/project/FILE.MD'
    const result = await preload.path_relative(target)

    expect_call_parameters_to_return(path.relative, [target], result)
  })

  it('should return value of path separator upon call to path_sep', async () => {
    const target = '/project/FILE.MD'
    const result = await preload.path_sep(target)

    expect(result).toBe(path.sep)
  })
})