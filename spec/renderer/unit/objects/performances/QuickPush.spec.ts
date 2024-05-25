import { describe, beforeEach, it, expect, vi } from 'vitest'
import QuickPush from '@/objects/performances/QuickPush'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

describe('objects/performances/QuickPush', () => {
  let dispatch

  beforeEach(() => {
    dispatch = vi.fn(async () => false)
  })

  it('should trigger Push performance upon call to QuickPush.perform', async () => {
    await QuickPush.perform(dispatch)

    expect(dispatch).toHaveBeenCalledWith('system/perform', 'push')
  })
})
