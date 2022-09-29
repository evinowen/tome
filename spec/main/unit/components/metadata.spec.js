const { cloneDeep } = require('lodash')
const electron = require('electron')
const { expect_call_parameters_to_return } = require('?/helpers')(expect)
const _component = require('@/components/metadata')
const preload = require('@/components/metadata/preload')

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
    const result = await preload.app.getPath(target)

    expect_call_parameters_to_return(electron.app.getPath, [target], result)
  })

  it('should return process version upon call to getPath', async () => {
    const result = await preload.app.getVersion()

    expect(result).toBe(process.env.npm_package_version)
  })

  it('should return process data upon call to getProcess', async () => {
    const result = await preload.app.getProcess()

    expect(result).not.toBeUndefined()
  })
})
