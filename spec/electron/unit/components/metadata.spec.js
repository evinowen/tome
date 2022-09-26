const { cloneDeep } = require('lodash')
const electron = require('electron')
const { expect_call_parameters_to_return } = require('@/../spec/helpers')(expect)
const _component = require('@/../electron/components/metadata')
const preload = require('@/../electron/components/metadata/preload')

let ipcMainMap

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() },
  app: {
    getPath: jest.fn()
  }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

describe('MetadataComponent', () => {
  let component

  beforeEach(() => {
    ipcMainMap = new Map()
    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call for and return application path of target upon call to app_getPath', async () => {
    const target = 'main'
    const result = await preload.app_getPath(target)

    expect_call_parameters_to_return(electron.app.getPath, [target], result)
  })

  it('should return process version upon call to app_getPath', async () => {
    const result = await preload.app_getVersion()

    expect(result).toBe(process.env.npm_package_version)
  })

  it('should return process data upon call to app_getProcess', async () => {
    const result = await preload.app_getProcess()

    expect(result).not.toBeUndefined()
  })
})
