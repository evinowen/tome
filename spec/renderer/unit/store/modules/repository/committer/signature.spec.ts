import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import signature, { State as SignatureState } from '@/store/modules/repository/committer/signature'
import { cloneDeep } from 'lodash'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  signature: SignatureState
}

describe('store/modules/repository/committer/signature', () => {
  let store

  const log = vi.fn()

  beforeEach(() => {
    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: { signature },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should store signature data on dispatch of signature actions', async () => {
    const name = 'Fred'
    const email = 'fred@example.com'

    await store.dispatch('signature/name', name)
    await store.dispatch('signature/email', email)

    expect(store.state.signature.name).toEqual(name)
    expect(store.state.signature.email).toEqual(email)
  })

  it('should store commit message on dispatch of message action', async () => {
    const message = 'Commit Message'

    await store.dispatch('signature/message', message)

    expect(store.state.signature.message).toEqual(message)
  })

  it('should create commit message on dispatch of message action with blank value', async () => {
    await store.dispatch('signature/message')

    expect(store.state.signature.message).not.toBeUndefined()
  })

  it('should flag name_error when name is empty upon dispatch of check', async () => {
    expect(store.state.signature.name_error).toEqual(false)

    await store.dispatch('signature/name', '')
    const result = await store.dispatch('signature/check')

    expect(result).toEqual(false)
  })

  it('should return false when name is empty upon dispatch of check', async () => {
    expect(store.state.signature.name_error).toEqual(false)

    await store.dispatch('signature/name', '')
    await store.dispatch('signature/check')

    expect(store.state.signature.name_error).toEqual(true)
  })

  it('should flag email_error when email is empty upon dispatch of check', async () => {
    expect(store.state.signature.email_error).toEqual(false)

    await store.dispatch('signature/email', '')
    await store.dispatch('signature/check')

    expect(store.state.signature.email_error).toEqual(true)
  })

  it('should return false when email is empty upon dispatch of check', async () => {
    expect(store.state.signature.email_error).toEqual(false)

    await store.dispatch('signature/email', '')
    const result = await store.dispatch('signature/check')

    expect(result).toEqual(false)
  })

  it('should return true when name and email are not empty upon dispatch of check', async () => {
    expect(store.state.signature.email_error).toEqual(false)

    await store.dispatch('signature/name', 'John Doe')
    await store.dispatch('signature/email', 'jdoe@example.com')
    const result = await store.dispatch('signature/check')

    expect(result).toEqual(true)
  })

  it('should reset name_error and email_error flags upon dispatch of check', async () => {
    expect(store.state.signature.email_error).toEqual(false)

    await store.dispatch('signature/name', '')
    await store.dispatch('signature/email', '')
    await store.dispatch('signature/check')

    expect(store.state.signature.name_error).toEqual(true)
    expect(store.state.signature.email_error).toEqual(true)

    await store.dispatch('signature/uncheck')

    expect(store.state.signature.name_error).toEqual(false)
    expect(store.state.signature.email_error).toEqual(false)
  })
})
