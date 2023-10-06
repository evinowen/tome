import { cloneDeep } from 'lodash'
import * as electron from 'electron'
import * as path from 'node:path'
import helpers from '../../helpers'
import _component from '@/components/path'
import preload from '@/components/path/preload'

let ipcMainMap
const { random_string, expect_call_parameters_to_return } = helpers(expect)

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    removeHandler: jest.fn()
  },
  ipcRenderer: { invoke: jest.fn() }
}))

const mocked_electron = jest.mocked(electron)
mocked_electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
mocked_electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('node:path', () => ({
  basename: jest.fn(),
  dirname: jest.fn(),
  extname: jest.fn(),
  parse: jest.fn(),
  join: jest.fn(),
  relative: jest.fn(),
  sep: 'separator'
}))

const mocked_path = jest.mocked(path)
mocked_path.basename.mockImplementation(() => random_string(16, true))
mocked_path.dirname.mockImplementation(() => random_string(16, true))
mocked_path.extname.mockImplementation(() => random_string(16, true).toLocaleLowerCase())
mocked_path.parse.mockImplementation(() => ({ name: random_string(), ext: random_string() } as path.ParsedPath))
mocked_path.join.mockImplementation((...input) => input.join('/'))
mocked_path.relative.mockImplementation(() => random_string(16, true))

describe('components/path', () => {
  let component

  beforeEach(() => {
    ipcMainMap = new Map()

    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call for and return basename of target upon call to basename', async () => {
    const target = '/project'
    const result = await preload.basename(target)

    expect_call_parameters_to_return(path.basename, [target], result)
  })

  it('should call for and return dirname of target upon call to basename', async () => {
    const target = '/project'
    const result = await preload.dirname(target)

    expect_call_parameters_to_return(path.dirname, [target], result)
  })

  it('should call for and return lower case extension of target upon call to extension', async () => {
    const target = '/project/FILE.MD'
    const result = await preload.extension(target)

    expect_call_parameters_to_return(path.extname, [target], result.toLowerCase())
  })

  it('should return undefined if extension cannot be identified upon call to extension', async () => {
    mocked_path.extname.mockImplementationOnce(() => '')

    const target = '/project/FILE.MD'
    await preload.extension(target)

    expect_call_parameters_to_return(path.extname, [target], '')
  })

  it('should call for and return joined path upon call to join', async () => {
    const dirname = '/project'
    const basename = 'FILE.MD'
    const result = await preload.join(dirname, basename)

    expect_call_parameters_to_return(path.join, [dirname, basename], result)
  })

  it('should call for and return relative path upon call to relative', async () => {
    const target = '/project/FILE.MD'
    const result = await preload.relative(target)

    expect_call_parameters_to_return(path.relative, [target], result)
  })

  it('should return value of path separator upon call to sep', async () => {
    const target = '/project/FILE.MD'
    const result = await preload.sep(target)

    expect(result).toBe(path.sep)
  })
})
