import { jest, describe, afterEach, it, expect } from '@jest/globals'
import Application from '@/Application'

jest.mock('@/Application')
const mocked_Application = jest.mocked(Application)

describe('main', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should create and execute the Application', async () => {
    expect(mocked_Application).not.toHaveBeenCalled()

    const promise = await import('@/main')
    await promise

    expect(mocked_Application).toHaveBeenCalledTimes(1)
    expect(mocked_Application.mock.instances[0].execute).toHaveBeenCalledTimes(1)
  })
})
