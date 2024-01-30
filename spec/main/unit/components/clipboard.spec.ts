import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import Disk from '../../mocks/support/disk'
import * as electron from 'electron'
import * as fs from 'node:fs'
import * as path from 'node:path'
import helpers from '../../helpers'
import _component from '@/components/clipboard'
import { clipboard as preload } from '@/preload'
import fs_meta from '../../meta/node/fs'
import * as fs_mock from '../../mocks/node/fs'
import * as electron_meta from '?/meta/electron'
import * as electron_mock from '?/mocks/electron'

jest.doMock('electron', () => electron_mock)
jest.doMock('node:fs', () => fs_mock)

const { random_string, expect_call_parameters_to_return } = helpers(expect)

jest.mock('node:path', () => ({
  basename: jest.fn(),
  dirname: jest.fn(),
  parse: jest.fn(),
  join: jest.fn(),
}))

const mocked_path = jest.mocked(path)
mocked_path.basename.mockImplementation(() => random_string(16, true))
mocked_path.dirname.mockImplementation(() => random_string(16, true))
mocked_path.parse.mockImplementation(() => ({ name: random_string(), base: random_string(), ext: random_string(), root: random_string(), dir: random_string() }))
mocked_path.join.mockImplementation((...input) => input.join('/'))

describe('components/clipboard', () => {
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

  it('should call to write text to clipboard upon call to writetext', async () => {
    const text = 'text'
    await preload.writetext(text)

    expect_call_parameters_to_return(electron.clipboard.writeText, [ text ])
  })

  it('should call for and return clipboard text upon call to readtext', async () => {
    const result = await preload.readtext()

    expect_call_parameters_to_return(electron.clipboard.readText, [], result)
  })

  it('should rename source upon call to paste as cut', async () => {
    const action = 'cut'
    const source = '/project/first/a.md'
    const target = '/project/second/b.md'

    await preload.paste(action, source, target)

    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.rename).toHaveBeenCalled()
  })

  it('should copy source upon call to paste as copy', async () => {
    const action = 'copy'
    const source = '/project/first/a.md'
    const target = '/project/second/b.md'

    await preload.paste(action, source, target)

    expect(fs.copyFile).toHaveBeenCalled()
    expect(fs.rename).not.toHaveBeenCalled()
  })

  it('should throw error destination does not exist upon call to paste', async () => {
    const action = 'copy'
    const source = '/project/first'
    const target = '/project/fake'

    await expect(preload.paste(action, source, target)).rejects.toBeDefined()

    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.rename).not.toHaveBeenCalled()
  })

  it('should throw error when source and destination match upon call to paste', async () => {
    mocked_path.dirname.mockImplementationOnce((path) => path)

    const action = 'copy'
    const source = '/project/first'
    const target = '/project/first'

    await expect(preload.paste(action, source, target)).rejects.toBeDefined()

    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.rename).not.toHaveBeenCalled()
  })
})
