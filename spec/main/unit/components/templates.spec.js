const { cloneDeep } = require('lodash')
const electron = require('electron')
const { reset_disk } = require('?/mocks/support/disk')
const Mustache = require('mustache')
const _component = require('@/components/templates')
const preload = require('@/components/templates/preload')

let ipcMainMap

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('node:fs', () => require('?/mocks/fs'))
jest.mock('node:path', () => require('?/mocks/path'))
jest.mock('mustache', () => ({ render: jest.fn() }))

Mustache.render.mockImplementation(() => 'Mock Rendered')

describe('components/templates', () => {
  let component

  beforeEach(() => {
    reset_disk()

    ipcMainMap = new Map()
    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should find and invoke template upon call to invoke', async () => {
    const source = '/project/.tome/templates/example.template.a'
    const target = '/project/.tome/first'

    const result = await preload.invoke(source, target)

    expect(result.success).toBeTruthy()
  })
})
