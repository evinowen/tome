/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeEach, it, expect } from '@jest/globals'
import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'
import { RepositoryNotLoadedError } from '@/objects/repository/RepositoryErrors'

describe('objects/repository/RepositoryDelegate', () => {
  let repository: any

  beforeEach(() => {
    repository = {}
  })

  it('should construct succesffully without throw when defined repository is provided', async () => {
    expect(() => new RepositoryDelegate(repository)).not.toThrow()
  })

  it('should throw when undefined repository is provided', async () => {
    expect(() => new RepositoryDelegate(undefined)).toThrow()
  })

  it('should throw RepositoryNotLoadedError when undefined repository is provided', async () => {
    expect(() => new RepositoryDelegate(undefined)).toThrowError(RepositoryNotLoadedError)
  })
})
