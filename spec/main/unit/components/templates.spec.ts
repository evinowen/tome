import { cloneDeep } from 'lodash'
import * as electron from 'electron'
import Disk from '../../mocks/support/disk'
import * as Mustache from 'mustache'
import _component from '@/components/templates'
import preload from '@/components/templates/preload'
import fs_meta from '../../meta/node/fs'
import * as fs_mock from '../../mocks/node/fs'

let ipcMainMap

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() }
}))

const mocked_electron = jest.mocked(electron)
mocked_electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
mocked_electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.setMock('node:fs', () => fs_mock)
jest.mock('node:path')
jest.mock('mustache', () => ({ render: jest.fn() }))

const mocked_Mustache = jest.mocked(Mustache)
mocked_Mustache.render.mockImplementation(() => 'Mock Rendered')

describe('components/templates', () => {
  let component
  const disk = new Disk

  beforeEach(() => {
    fs_meta.set_disk(disk)
    disk.reset_disk()

    ipcMainMap = new Map()
    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should find and invoke template upon call to invoke', async () => {
    disk.reset_disk()
    const source = '/project/.tome/templates/example.template.a'
    const target = '/project/.tome/first'

    const result = await preload.invoke(source, target)

    expect(result.success).toBeTruthy()
  })
})
