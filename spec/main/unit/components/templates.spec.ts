import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import Disk from '../../mocks/support/disk'
import * as Mustache from 'mustache'
import _component from '@/components/templates'
import { template as preload } from '@/preload'
import fs_meta from '../../meta/node/fs'
import * as fs_mock from '../../mocks/node/fs'
import * as electron_meta from '?/meta/electron'
import * as electron_mock from '?/mocks/electron'

jest.doMock('node:fs', () => fs_mock)
jest.doMock('electron', () => electron_mock)

jest.mock('node:path')
jest.mock('mustache', () => ({ render: jest.fn() }))

const mocked_Mustache = jest.mocked(Mustache)
mocked_Mustache.render.mockImplementation(() => 'Mock Rendered')

describe('components/templates', () => {
  let component
  const disk = new Disk()

  beforeEach(() => {
    electron_meta.ipc_reset()

    fs_meta.set_disk(disk)
    disk.reset_disk()

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
