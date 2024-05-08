import { describe, afterEach, it, expect, vi } from 'vitest'
import { format } from '@/modules/Titles'

describe('modules/Titles', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should throw Error if format function is provided falsy value', async () => {
    expect(() => format('')).toThrowError()
  })

  it('should throw Error if format function is provided value with invalid characters', async () => {
    expect(() => format('%')).toThrowError()
  })

  it('should format title without extension when format function is provided valid file name', async () => {
    const title = format('example.name.md')

    expect(title).toBe('Example Name')
  })

  it('should format title without expecting extension when format function is provided valid directory name', async () => {
    const title = format('example.name', true)

    expect(title).toBe('Example Name')
  })
})
