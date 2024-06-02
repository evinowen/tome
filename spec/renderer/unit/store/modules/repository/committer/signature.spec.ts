import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_committer_signature_store } from '@/store/modules/repository/committer/signature'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/repository/committer/signature', () => {
  let repository_committer_signature

  beforeEach(() => {
    setActivePinia(createPinia())

    repository_committer_signature = fetch_repository_committer_signature_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should store signature data on dispatch of signature actions', async () => {
    const name = 'Fred'
    const email = 'fred@example.com'

    await repository_committer_signature.sign_name(name)
    await repository_committer_signature.sign_email(email)

    expect(repository_committer_signature.name).toEqual(name)
    expect(repository_committer_signature.email).toEqual(email)
  })

  it('should store commit message on dispatch of message action', async () => {
    const message = 'Commit Message'

    await repository_committer_signature.sign_message(message)

    expect(repository_committer_signature.message).toEqual(message)
  })

  it('should create commit message on dispatch of message action with blank value', async () => {
    await repository_committer_signature.sign_message()

    expect(repository_committer_signature.message).not.toBeUndefined()
  })

  it('should flag name_error when name is empty upon dispatch of check', async () => {
    expect(repository_committer_signature.name_error).toEqual(false)

    await repository_committer_signature.sign_name('')
    const result = await repository_committer_signature.check()

    expect(result).toEqual(false)
  })

  it('should return false when name is empty upon dispatch of check', async () => {
    expect(repository_committer_signature.name_error).toEqual(false)

    await repository_committer_signature.sign_name('')
    await repository_committer_signature.check()

    expect(repository_committer_signature.name_error).toEqual(true)
  })

  it('should flag email_error when email is empty upon dispatch of check', async () => {
    expect(repository_committer_signature.email_error).toEqual(false)

    await repository_committer_signature.sign_email('')
    await repository_committer_signature.check()

    expect(repository_committer_signature.email_error).toEqual(true)
  })

  it('should return false when email is empty upon dispatch of check', async () => {
    expect(repository_committer_signature.email_error).toEqual(false)

    await repository_committer_signature.sign_email('')
    const result = await repository_committer_signature.check()

    expect(result).toEqual(false)
  })

  it('should return true when name and email are not empty upon dispatch of check', async () => {
    expect(repository_committer_signature.email_error).toEqual(false)

    await repository_committer_signature.sign_name('John Doe')
    await repository_committer_signature.sign_email('jdoe@example.com')
    const result = await repository_committer_signature.check()

    expect(result).toEqual(true)
  })

  it('should reset name_error and email_error flags upon dispatch of check', async () => {
    expect(repository_committer_signature.email_error).toEqual(false)

    await repository_committer_signature.sign_name('')
    await repository_committer_signature.sign_email('')
    await repository_committer_signature.check()

    expect(repository_committer_signature.name_error).toEqual(true)
    expect(repository_committer_signature.email_error).toEqual(true)

    await repository_committer_signature.uncheck()

    expect(repository_committer_signature.name_error).toEqual(false)
    expect(repository_committer_signature.email_error).toEqual(false)
  })
})
