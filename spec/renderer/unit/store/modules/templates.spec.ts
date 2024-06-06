import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_templates_store } from '@/store/modules/templates'
import { fetch_files_store } from '@/store/modules/files'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/modules/log', () => ({
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

describe('store/modules/templates', () => {
  let templates
  let files
  let post

  const disk = new Disk()
  set_disk(disk)

  const mock_fetch_files_store = vi.mocked(fetch_files_store)

  beforeEach(() => {
    setActivePinia(createPinia())

    disk.reset_disk()
    disk.set_content_default('{}')

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

    templates = fetch_templates_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(templates.target).toEqual({ base: '', absolute: '', relative: '' })
    expect(templates.options).toEqual([])
  })

  it('should set path and base then load template list when load is dispatched', async () => {
    const project = '/project'

    await templates.load({ path: project })

    expect(templates.target).not.toBeUndefined()
    expect(templates.target.base).toEqual(project)
    expect(templates.target.absolute).toEqual('/project/.tome/templates')
    expect(templates.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain templates when load is dispatched', async () => {
    const project = '/project'

    disk.unset_disk('/project/.tome/templates')

    await templates.load({ path: project })

    expect(templates.target).not.toBeUndefined()
    expect(templates.target.base).toEqual(project)
    expect(templates.options).toEqual([])
  })

  it('should fail gracefully if templates in path is a file when load is dispatched', async () => {
    const project = '/project'

    disk.unset_disk('/project/.tome/templates')

    await templates.load({ path: project })

    expect(templates.target).not.toBeUndefined()
    expect(templates.target.base).toEqual(project)
    expect(templates.options).toEqual([])
  })

  it('should execute templates against the target path when execute is dispatched', async () => {
    const project = '/project'
    const template = 'example.template.a'
    const target = '/project/first'

    await templates.load({ path: project })
    await templates.execute({ name: template, target })

    expect(mocked_api.template.invoke).toHaveBeenCalledWith(`${project}/.tome/templates/${template}`, target)
  })

  it('should dispatch load and select if result is returned from template when execute is dispatched', async () => {
    mocked_api.template.invoke.mockImplementation(() => Promise.resolve({ success: true, result: '/path' }))

    const project = '/project'
    const template = 'example.template.a'
    const target = '/project/first'

    await templates.load({ path: project })
    await templates.execute({ name: template, target })

    expect(files.load).toHaveBeenCalledTimes(1)
    expect(files.select).toHaveBeenCalledTimes(1)
  })

  it('should fail gracefully when invalid template name is provided when execute is dispatched', async () => {
    const project = '/project'
    const template = 'example.template.z'
    const target = '/project/first'

    await templates.load({ path: project })
    await templates.execute({ name: template, target })

    expect(mocked_api.template.invoke).not.toHaveBeenCalled()
  })

  it('should trigger a file ghost and post processing when ghost is dispatched', async () => {
    const project = '/project'

    await templates.load({ path: project })

    expect(post).toBeUndefined()
    expect(files.haunt).toHaveBeenCalledTimes(0)

    await templates.ghost()

    expect(post).not.toBeUndefined()
    expect(files.haunt).toHaveBeenCalledTimes(1)
    await post(project)

    expect(files.create).toHaveBeenCalledTimes(2)
    expect(files.save).toHaveBeenCalledTimes(2)
    expect(files.select).toHaveBeenCalledTimes(2)
  })
})
