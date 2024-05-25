import { describe, beforeEach, it, expect, vi } from 'vitest'
import Push from '@/objects/performances/Push'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

describe('objects/performances/Push', () => {
  let dispatch

  beforeEach(() => {
    dispatch = vi.fn(async () => false)
  })

  it('should complete Push performance upon call to Push.perform', async () => {
    await Push.perform(dispatch)

    expect(dispatch).toHaveBeenCalledWith('repository/push')
  })
})
