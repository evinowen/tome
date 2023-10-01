import { cloneDeep } from 'lodash'
import * as electron from 'electron'
import helpers from '../../helpers'
import _component from '@/components/metadata'
import preload from '@/components/metadata/preload'

let ipcMainMap
const { expect_call_parameters_to_return } = helpers(expect)

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    removeHandler: jest.fn()
  },
  ipcRenderer: { invoke: jest.fn() },
  app: {
    getPath: jest.fn()
  }
}))

const mocked_electron = jest.mocked(electron)
mocked_electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
mocked_electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

describe('components/metadata', () => {
  let component

  beforeEach(() => {
    ipcMainMap = new Map()
    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call for and return application path of target upon call to getPath', async () => {
    const target = 'main'
    const result = await preload.getPath(target)

    expect_call_parameters_to_return(electron.app.getPath, [target], result)
  })

  it('should return process version upon call to getPath', async () => {
    const result = await preload.getVersion()

    expect(result).toBe(process.env.npm_package_version)
  })

  it('should return process data upon call to getProcess', async () => {
    const result = await preload.getProcess()

    expect(result).not.toBeUndefined()
  })
})
