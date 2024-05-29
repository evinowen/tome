import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import _component from '@/components/repository'
import { repository as preload } from '@/preload'
import * as electron_meta from '?/meta/electron'
import * as electron_mock from '?/mocks/electron'

jest.doMock('electron', () => electron_mock)

jest.mock('@/objects/repository/RepositoryManager', () => ({
  default: {
    create: jest.fn().mockImplementation((path) => ({
      name: path,
      path,
      inspector: {
        inspect_all: jest.fn(),
      },
      comparator: {
        diff_path: jest.fn(),
        diff_commit: jest.fn(),
      },
      credentials: {
        configure_password: jest.fn(),
        configure_key: jest.fn(),
      },
      committer: {
        stage: jest.fn(),
        reset: jest.fn(),
        commit: jest.fn(() => ({
          tostrS: jest.fn(),
        })),
      },
      remotes: {
        active: {
          push: jest.fn(),
        },
        select: jest.fn(),
        load: jest.fn(),
        add: jest.fn(),
        remove: jest.fn(),
        push: jest.fn(),
        close: jest.fn(),
        list: [],
      },
      history: {
        items: [],
        load: jest.fn(),
      },
      branch: {
        status: jest.fn(),
        create: jest.fn(),
        select: jest.fn(),
        rename: jest.fn(),
        remove: jest.fn(),
      },
      tags: {
        fetch: jest.fn(),
        remove: jest.fn(),
      },
    })),
  },
}))

describe('components/repository', () => {
  let component
  let win
  let log

  beforeEach(() => {
    electron_meta.ipc_reset()

    win = {
      isMaximized: jest.fn(() => true),
      minimize: jest.fn(),
      maximize: jest.fn(),
      restore: jest.fn(),
      close: jest.fn(),
    }

    log = {
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
    }

    component = cloneDeep(_component)
    component.register(win, log)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should store constructor upon call to load', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)
  })

  it('should call RepositoryManager.inspector.inspect_all upon call to inspect', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    await preload.inspect()

    const { repository } = component.data()
    expect(repository.inspector.inspect_all).toHaveBeenCalled()
  })

  it('should call RepositoryManager.comparator.diff_path on repository upon call to diff_path', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    await preload.diff_path('')

    const { repository } = component.data()
    expect(repository.comparator.diff_path).toHaveBeenCalled()
  })

  it('should call RepositoryManager.comparator.diff_commit upon call to diff_commit', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    await preload.diff_commit('')

    const { repository } = component.data()
    expect(repository.comparator.diff_commit).toHaveBeenCalled()
  })

  it('should call RepositoryManager.credentials.configure_password upon call to credential_password', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const username = 'username'
    const password = 'password'

    await preload.credential_password(username, password)

    const { repository } = component.data()
    expect(repository.credentials.configure_password).toHaveBeenCalled()
  })

  it('should call RepositoryManager.credentials.configure_key upon call to credential_key', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const private_key = 'private-key'
    const public_key = 'public-key'
    const passphrase = 'passphrase'

    await preload.credential_key(private_key, public_key, passphrase)

    const { repository } = component.data()
    expect(repository.credentials.configure_key).toHaveBeenCalled()
  })

  it('should call RepositoryManager.committer.stage with query upon call to stage with add', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const target = 'file.md'

    await preload.stage(target)

    const { repository } = component.data()
    expect(repository.committer.stage).toHaveBeenCalled()
  })

  it('should call RepositoryManager.committer.stage with query upon call to stage with remove', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const target = 'file.md'

    await preload.stage(target)

    const { repository } = component.data()
    expect(repository.committer.stage).toHaveBeenCalled()
  })

  it('should call RepositoryManager.committer.reset upon call to reset', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const query = 'file.md'

    await preload.reset(query)

    const { repository } = component.data()
    expect(repository.committer.reset).toHaveBeenCalled()
  })

  it('should call RepositoryManager.committer.commit upon call to commit', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const name = 'John Doe'
    const email = 'jdoe@example.com'
    const message = 'Commit Message'

    await preload.commit(name, email, message)

    const { repository } = component.data()
    expect(repository.committer.commit).toHaveBeenCalled()
  })

  it('should call RepositoryManager.branch.status upon call to branch_status', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    await preload.branch_status()

    const { repository } = component.data()
    expect(repository.branch.status).toHaveBeenCalled()
  })

  it('should call RepositoryManager.branch.create upon call to branch_create', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const name = 'master'

    await preload.branch_create(name)

    const { repository } = component.data()
    expect(repository.branch.create).toHaveBeenCalled()
  })

  it('should call RepositoryManager.branch.select upon call to branch_select', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const name = 'master'

    await preload.branch_select(name)

    const { repository } = component.data()
    expect(repository.branch.select).toHaveBeenCalled()
  })

  it('should call RepositoryManager.branch.rename upon call to branch_rename', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const name = 'master'
    const value = 'main'

    await preload.branch_rename(name, value)

    const { repository } = component.data()
    expect(repository.branch.rename).toHaveBeenCalled()
  })

  it('should call RepositoryManager.branch.remove upon call to branch_remove', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const name = 'master'

    await preload.branch_remove(name)

    const { repository } = component.data()
    expect(repository.branch.remove).toHaveBeenCalled()
  })

  it('should call RepositoryManager.remotes.load upon call to remote_list', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const name = 'origin'

    await preload.remote_list(name)

    const { repository } = component.data()
    expect(repository.remotes.load).toHaveBeenCalled()
  })

  it('should call RepositoryManager.remotes.add upon call to remote_add', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const name = 'origin'

    await preload.remote_add(name)

    const { repository } = component.data()
    expect(repository.remotes.add).toHaveBeenCalled()
  })

  it('should call RepositoryManager.remotes.remove upon call to remote_remove', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const name = 'origin'

    await preload.remote_remove(name)

    const { repository } = component.data()
    expect(repository.remotes.remove).toHaveBeenCalled()
  })

  it('should call RepositoryManager.remotes.select upon call to remote_load', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const name = 'origin'

    await preload.remote_load(name)

    const { repository } = component.data()
    expect(repository.remotes.select).toHaveBeenCalled()
  })

  it('should call RepositoryManager.remotes.active.push upon call to push', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    await preload.push()

    const { repository } = component.data()
    expect(repository.remotes.active.push).toHaveBeenCalled()
  })

  it('should call RepositoryManager.remotes.close upon call to remote_clear', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    await preload.remote_clear()

    const { repository } = component.data()
    expect(repository.remotes.close).toHaveBeenCalled()
  })

  it('should return RepositoryManager.remotes status upon call to remote_status', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    await preload.remote_status()

    expect(result).toBeDefined()
  })

  it('should call RepositoryManager.history.load upon call to history_list', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const page = 1

    await preload.history_list(page)

    const { repository } = component.data()
    expect(repository.history.load).toHaveBeenCalled()
  })

  it('should call RepositoryManager.tags.fetch upon call to tag_list', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    await preload.tag_list()

    const { repository } = component.data()
    expect(repository.tags.fetch).toHaveBeenCalled()
  })

  it('should call RepositoryManager.tags.remove upon call to tag_remove', async () => {
    const path = '/project'
    const result = await preload.load(path)

    expect(result.path).toBe(path)

    const tag = 'v1.0.0'

    await preload.tag_remove(tag)

    const { repository } = component.data()
    expect(repository.tags.remove).toHaveBeenCalled()
    expect(repository.tags.remove).toHaveBeenCalledWith(tag)
  })
})
