const { cloneDeep } = require('lodash')
const electron = require('electron')
const { reset_disk } = require('@/../spec/mocks/support/disk')
const fs = require('fs')
const path = require('path')
const Mustache = require('mustache')
const { random_string } = require('@/../spec/helpers')(expect)
const _component = require('@/../electron/components/templates')
const preload = require('@/../electron/components/templates/preload')

let ipcMainMap

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('fs', () => require('@/../spec/mocks/fs'))
jest.mock('path', () => require('@/../spec/mocks/path'))
jest.mock('mustache', () => ({ render: jest.fn() }))

Mustache.render.mockImplementation(() => 'Mock Rendered')

describe('TemplatesComponent', () => {
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

  it('should find and invoke template upon call to template_invoke', async () => {
    const source = '/project/.tome/templates/example.template.a'
    const target = '/project/.tome/first'

    const result = await preload.template_invoke(source, target)

    expect(result.success).toBeTruthy()
  })
})
