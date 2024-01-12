import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import files, { State as FileState, ChokidarEvent } from '@/store/modules/files'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'
import { scafold as store_scafold } from '?/builders/store'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  files: FileState
}

describe('store/modules/files', () => {
  let store

  const disk = new Disk
  set_disk(disk)

  const identify = async (path) => {
    const relative = await store.state.files.tree.relative(path)
    return store.state.files.tree.identify(relative)
  }

  beforeEach(() => {
    disk.reset_disk()

    store = new Vuex.Store<State>(store_scafold({ modules: { files } }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should construct the file tree on initialize', async () => {
    const path = '/project'

    expect(store.state.files.tree).toBeUndefined()

    await store.dispatch('files/initialize', { path })

    expect(store.state.files.tree).not.toBeUndefined()
  })

  it('should remove the file tree on clear', async () => {
    const path = '/project'

    expect(store.state.files.tree).toBeUndefined()

    await store.dispatch('files/initialize', { path })

    expect(store.state.files.tree).not.toBeUndefined()

    await store.dispatch('files/clear')

    expect(store.state.files.tree).toBeUndefined()
  })

  it('should configure event listener for updates to tree path on initialize', async () => {
    const path = '/project'

    expect(store.state.files.tree).toBeUndefined()

    mocked_api.file.subscribe.mockImplementationOnce(async (target, listener) => {
      listener({ event: ChokidarEvent.ADD, path })
    })

    await store.dispatch('files/initialize', { path })

    expect(store.state.files.tree).not.toBeUndefined()

    expect(mocked_api.file.clear_subscriptions).toHaveBeenCalledTimes(1)
    expect(mocked_api.file.subscribe).toHaveBeenCalledTimes(1)
  })

  it('should reconstruct the file tree on reinitialize', async () => {
    const path = '/project'

    expect(store.state.files.tree).toBeUndefined()

    await store.dispatch('files/initialize', { path })

    expect(store.state.files.tree).not.toBeUndefined()

    const first = store.state.files.tree

    await store.dispatch('files/initialize', { path })

    expect(store.state.files.tree).not.toBe(first)
  })

  it('should expand a collapsed item on toggle', async () => {
    const path = '/project'
    const target = '/project/first'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: target })

    const { item } = await identify(target)

    expect(item.expanded).toBeFalsy()

    await store.dispatch('files/toggle', { path: target })

    expect(item.expanded).toBeTruthy()
  })

  it('should call to open object on open', async () => {
    const path = '/project'
    const target = '/project/first'

    expect(mocked_api.file.open).toHaveBeenCalledTimes(0)

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/open', { path: target })

    expect(mocked_api.file.open).toHaveBeenCalledTimes(1)
  })

  it('should collapse an expanded item on toggle', async () => {
    const path = '/project'
    const target = '/project/first'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: target })
    await store.dispatch('files/toggle', { path: target })

    const { item } = await identify(target)

    expect(item.expanded).toBeTruthy()

    await store.dispatch('files/toggle', { path: target })

    expect(item.expanded).toBeFalsy()
  })

  it('should set the selected path as active on select', async () => {
    const path = '/project'
    const directory = '/project/first'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })

    expect(store.state.files.active).toBe('')

    await store.dispatch('files/select', { path: directory })

    expect(store.state.files.active).not.toBe('')
  })

  it('should load the content from targed item on select when the item is a file', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/load', { path: target })

    expect(store.state.files.content).toBe('')

    await store.dispatch('files/select', { path: target })

    expect(store.state.files.content).not.toBe('')
  })

  it('should store the content of the selected item on save', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/load', { path: target })
    await store.dispatch('files/select', { path: target })

    const content = 'Test Content'

    expect(store.state.files.content).not.toBe(content)

    await store.dispatch('files/save', { path: target, content })

    expect(mocked_api.file.write).toHaveBeenCalledTimes(1)
  })

  it('should place the ghost adjacent to the target provided', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/load', { path: target })
    await store.dispatch('files/ghost', { path: target, directory: true })

    expect(store.state.files.ghost).toBeDefined()
    const ghost = store.state.files.directory[store.state.files.ghost]
    expect(ghost.parent.path).toBe(directory)
  })

  it('should use the the ghost adjacent to the target provided', async () => {
    const path = '/project'
    const directory = '/project/first'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/ghost', { path: directory, target: 'a.md', directory: true })

    expect(store.state.files.ghost).toBeDefined()
    const ghost = store.state.files.directory[store.state.files.ghost]
    expect(ghost.parent.path).toBe(directory)
  })

  it('should replace ghost when a ghost already exists', async () => {
    const path = '/project'
    const first = '/project/first'
    const second = '/project/second'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: first })
    await store.dispatch('files/load', { path: second })
    await store.dispatch('files/ghost', { path: first, directory: true })

    expect(store.state.files.ghost).toBeDefined()
    const ghost_first = store.state.files.directory[store.state.files.ghost]
    expect(ghost_first.parent.path).toBe(first)

    await store.dispatch('files/ghost', { path: second, directory: true })

    expect(store.state.files.ghost).toBeDefined()
    const ghost_second = store.state.files.directory[store.state.files.ghost]
    expect(ghost_second.parent.path).toBe(second)
  })

  it('should create a new directory item on submit when directory item is ephemeral', async () => {
    const path = '/project'
    const directory = '/project/first'
    const input = 'new'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/ghost', { path: directory, directory: true })

    const { item } = await identify(directory)

    expect(item.directory).toBeTruthy()
    expect(mocked_api.file.create_directory).toHaveBeenCalledTimes(0)

    await store.dispatch('files/submit', { path: directory, input, title: false })

    expect(mocked_api.file.create_directory).toHaveBeenCalledTimes(1)
  })

  it('should fail gracefully when creating a new item that already exists', async () => {
    const path = '/project'
    const directory = '/project/first'
    const input = 'a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/ghost', { path: directory, directory: true })

    const { item } = await identify(directory)

    expect(item.directory).toBeTruthy()
    expect(mocked_api.file.create_directory).toHaveBeenCalledTimes(0)

    await expect(store.dispatch('files/submit', { path: directory, input, title: false })).rejects.toBeDefined()
  })

  it('should create a new file item on submit when file item is ephemeral', async () => {
    const path = '/project'
    const directory = '/project/first'
    const input = 'new'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/ghost', { path: directory, directory: false })

    const { item } = await identify(directory)

    expect(item.directory).toBeTruthy()
    expect(mocked_api.file.create).toHaveBeenCalledTimes(0)

    await store.dispatch('files/submit', { path: directory, input, title: false })

    expect(mocked_api.file.create).toHaveBeenCalledTimes(1)
  })

  it('should rename item on submit when item is not ephemeral', async () => {
    const path = '/project'
    const directory = '/project/first'
    const input = 'new'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/edit', { path: directory })

    const { item: item_before } = await identify(directory)

    await store.dispatch('files/submit', { input, title: false })

    const { item: item_after } = await identify(path)

    expect(item_after.name).not.toBe(item_before.name)
  })

  it('should rename item on submit and reformat correctly when item is not ephemeral and in title mode', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'
    const result = '/project/first/new.file.name.md'
    const input = 'New File Name'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/load', { path: target })
    await store.dispatch('files/edit', { path: target })

    const { item: item_before } = await identify(target)

    await store.dispatch('files/submit', { path: target, input, title: true })
    await store.dispatch('files/load', { path: directory })

    const { item: item_after } = await identify(result)

    expect(item_after).not.toBeUndefined()
    expect(item_after.name).not.toBe(item_before.name)
    expect(item_after.path).toBe(result)
    expect(item_after.name).toBe('new.file.name.md')
  })

  it('should clear edit when blur is called while editing', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: directory })
    await store.dispatch('files/load', { path: target })
    await store.dispatch('files/edit', { path: target })

    expect(store.state.files.editing).toBeTruthy()

    await store.dispatch('files/blur', { path: target })

    expect(store.state.files.editing).toBeFalsy()
  })

  it('should relocate item on move', async () => {
    const path = '/project'
    const target_directory = '/project/first'
    const target = '/project/first/a.md'
    const proposed_directory = '/project/second'
    const proposed = '/project/second/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: target_directory })
    await store.dispatch('files/load', { path: proposed_directory })

    const { item: item_before } = await identify(target)
    expect(item_before).toBeDefined()

    await store.dispatch('files/move', { path: target, proposed: proposed_directory })

    const { item: item_previous } = await identify(target)
    const { item: item_current } = await identify(proposed)
    expect(item_previous).toBeUndefined()
    expect(item_current).toBeDefined()
  })

  it('should relocate item on move to proposed parent if proposed is not a directory', async () => {
    const path = '/project'
    const target_directory = '/project/first'
    const target = '/project/first/a.md'
    const proposed_directory = '/project/second'
    const proposed = '/project/second/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: target_directory })
    await store.dispatch('files/load', { path: proposed_directory })

    const { item: item_before } = await identify(target)
    expect(item_before).toBeDefined()

    await store.dispatch('files/move', { path: target, proposed: proposed_directory })

    await store.dispatch('files/load', { path: target_directory })
    await store.dispatch('files/load', { path: proposed_directory })

    const { item: item_previous } = await identify(target)
    const { item: item_current } = await identify(proposed)
    expect(item_previous).toBeUndefined()
    expect(item_current).toBeDefined()
  })

  it('should not relocate item on move if the directory does not change', async () => {
    const path = '/project'
    const target_directory = '/project/first'
    const target = '/project/first/a.md'
    const proposed_directory = '/project/first'
    const proposed = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })
    await store.dispatch('files/load', { path: target_directory })
    await store.dispatch('files/load', { path: proposed_directory })

    const { item: item_before } = await identify(target)
    expect(item_before).toBeDefined()

    await store.dispatch('files/move', { path: target, proposed: proposed_directory })

    const { item: item_previous } = await identify(target)
    const { item: item_current } = await identify(proposed)

    expect(item_previous).toEqual(item_current)
  })

  it('should remove item on delete', async () => {
    const path = '/project'
    const directory = '/project/third'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/load', { path })

    const { item: item_before } = await identify(directory)

    expect(item_before).not.toBeUndefined()

    await store.dispatch('files/delete', { path: directory })

    const { item: item_after } = await identify(directory)

    expect(item_after).toBeUndefined()
  })
})
