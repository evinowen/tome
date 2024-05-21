import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import _input, { State as InputState } from '@/store/modules/input'
import { cloneDeep } from 'lodash'

interface State {
  input: InputState
}

describe('store/modules/input', () => {
  let input

  const factory = {
    wrap: () => new Vuex.Store<State>({
      modules: {
        input,
      },
    }),
  }

  beforeEach(() => {
    input = cloneDeep(_input)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const store = factory.wrap()
    expect(store).toBeDefined()
  })
})
