import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_actions_store } from '@/store/modules/actions'
import { fetch_files_store } from '@/store/modules/files'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

vi.mock('@/store/modules/files', () => ({
  fetch_files_store: vi.fn(),
}))

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/actions', () => {
  let actions

  let files
  let post

  const disk = new Disk()
  set_disk(disk)

  const mock_fetch_files_store = vi.mocked(fetch_files_store)

  beforeEach(() => {
    setActivePinia(createPinia())

    disk.reset_disk()

    post = undefined
    files = {
      create: vi.fn(),
      identify: vi.fn(async () => ({})),
      haunt: vi.fn(async (criteria) => {
        post = criteria.post
      }),
      load: vi.fn(),
      select: vi.fn(),
      save: vi.fn(),
    }

    mock_fetch_files_store.mockReturnValue(files)

    actions = fetch_actions_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(actions.target).toEqual({ base: '', absolute: '', relative: '' })
    expect(actions.options).toEqual([])
  })

  it('should set path and base then load action list when load is dispatched', async () => {
    const project = '/project'

    await actions.load({ path: project })

    expect(actions.target).not.toBeUndefined()
    expect(actions.target.base).toEqual(project)
    expect(actions.target.absolute).toEqual('/project/.tome/actions')
    expect(actions.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain actions when load is dispatched', async () => {
    const project = '/project'

    disk.unset_disk('/project/.tome/actions')

    await actions.load({ path: project })

    expect(actions.target).not.toBeUndefined()
    expect(actions.target.base).toEqual(project)
    expect(actions.options).toEqual([])
  })

  it('should fail gracefully if actions in path is a file when load is dispatched', async () => {
    const project = '/project'

    disk.unset_disk('/project/.tome/actions')

    await actions.load({ path: project })

    expect(actions.target).not.toBeUndefined()
    expect(actions.target.base).toEqual(project)
    expect(actions.options).toEqual([])
  })

  it('should execute actions against the target path when execute is dispatched', async () => {
    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await actions.load({ path: project })
    await actions.execute({ name: action, target })

    expect(mocked_api.action.invoke).toHaveBeenCalledWith(`${project}/.tome/actions/${action}`, target, undefined)
  })

  it('should execute actions with specific input provided when execute is dispatched', async () => {
    mocked_api.action.invoke.mockImplementationOnce(() => Promise.resolve({ success: true, message: 'specific message', input: '' }))

    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'
    const input = 'Example Input'

    await actions.load({ path: project })
    await actions.execute({ name: action, target, input })

    expect(mocked_api.action.invoke).toHaveBeenCalledWith(`${project}/.tome/actions/${action}`, target, input)
  })

  it('should provide error if executed action failed when execute is dispatched', async () => {
    mocked_api.action.invoke.mockImplementation(() => Promise.resolve({ success: false, message: 'Error Message', input: '' }))

    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await actions.load({ path: project })
    const { error } = await actions.execute({ name: action, target })

    expect(error).not.toBeUndefined()
  })

  it('should provide error with default message if executed action failed and no message provided when execute is dispatched', async () => {
    mocked_api.action.invoke.mockImplementation(() => Promise.resolve({ success: false, message: '', input: '' }))

    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await actions.load({ path: project })
    const { error } = await actions.execute({ name: action, target })

    expect(error).not.toBeUndefined()
  })

  it('should fail gracefully when invalid action name is provided when execute is dispatched', async () => {
    const project = '/project'
    const action = 'example.action.z'
    const target = '/project/first'

    await actions.load({ path: project })
    await actions.execute({ name: action, target })
  })

  it('should trigger a file ghost and post processing when ghost is dispatched', async () => {
    const project = '/project'

    await actions.load({ path: project })

    expect(post).toBeUndefined()
    expect(files.haunt).toHaveBeenCalledTimes(0)

    await actions.ghost()

    expect(post).not.toBeUndefined()
    expect(files.haunt).toHaveBeenCalledTimes(1)

    await post(project)

    expect(files.create).toHaveBeenCalledTimes(1)
    expect(files.save).toHaveBeenCalledTimes(1)
    expect(files.select).toHaveBeenCalledTimes(1)
  })
})
