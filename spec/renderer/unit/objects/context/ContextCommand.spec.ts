import { describe, afterEach, it, expect, vi } from 'vitest'
import ContextCommand, { ContextCommandFactory } from '@/objects/context/ContextCommand'

describe('objects/context/ContextCommand', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initalize to blank values when ContextCommand objects are created', async () => {
    const command = new ContextCommand()

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(false)
    expect(command.shift).toEqual(false)
    expect(command.alt).toEqual(false)
    expect(command.key).toEqual('')
  })

  it('should print blank value on call to ContextCommand print method when ContextCommand has blank values', async () => {
    const command = new ContextCommand()

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(false)
    expect(command.shift).toEqual(false)
    expect(command.alt).toEqual(false)
    expect(command.key).toEqual('')

    expect(command.print()).toEqual('')
  })

  it('should print Ctrl on call to ContextCommand print method when ContextCommand control is true', async () => {
    const command = new ContextCommand()
    command.control = true

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(true)
    expect(command.shift).toEqual(false)
    expect(command.alt).toEqual(false)
    expect(command.key).toEqual('')

    expect(command.print()).toEqual('Ctrl')
  })

  it('should print Alt on call to ContextCommand print method when ContextCommand alt is true', async () => {
    const command = new ContextCommand()
    command.alt = true

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(false)
    expect(command.shift).toEqual(false)
    expect(command.alt).toEqual(true)
    expect(command.key).toEqual('')

    expect(command.print()).toEqual('Alt')
  })

  it('should print Shift on call to ContextCommand print method when ContextCommand shift is true', async () => {
    const command = new ContextCommand()
    command.shift = true

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(false)
    expect(command.shift).toEqual(true)
    expect(command.alt).toEqual(false)
    expect(command.key).toEqual('')

    expect(command.print()).toEqual('Shift')
  })

  it('should print key value on call to ContextCommand print method when ContextCommand key has value', async () => {
    const command = new ContextCommand()
    const key = 'Value'
    command.key = key

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(false)
    expect(command.shift).toEqual(false)
    expect(command.alt).toEqual(false)
    expect(command.key).toEqual(key)

    expect(command.print()).toEqual(key)
  })

  it('should print Ctrl+Key value on call to ContextCommand print method when ContextCommand key has value and control is true', async () => {
    const command = new ContextCommand()
    command.control = true
    const key = 'Value'
    command.key = key

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(true)
    expect(command.shift).toEqual(false)
    expect(command.alt).toEqual(false)
    expect(command.key).toEqual(key)

    expect(command.print()).toEqual(`Ctrl+${key}`)
  })

  it('should print Shift+Key value on call to ContextCommand print method when ContextCommand key has value and shift is true', async () => {
    const command = new ContextCommand()
    command.shift = true
    const key = 'Value'
    command.key = key

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(false)
    expect(command.alt).toEqual(false)
    expect(command.shift).toEqual(true)
    expect(command.key).toEqual(key)

    expect(command.print()).toEqual(`Shift+${key}`)
  })

  it('should print Alt+Key value on call to ContextCommand print method when ContextCommand key has value and alt is true', async () => {
    const command = new ContextCommand()
    command.alt = true
    const key = 'Value'
    command.key = key

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(false)
    expect(command.shift).toEqual(false)
    expect(command.alt).toEqual(true)
    expect(command.key).toEqual(key)

    expect(command.print()).toEqual(`Alt+${key}`)
  })

  it('should print Ctrl+Shift+Key value on call to ContextCommand print method when ContextCommand key has value and both control and shift are true', async () => {
    const command = new ContextCommand()
    command.control = true
    command.shift = true
    const key = 'Value'
    command.key = key

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(true)
    expect(command.shift).toEqual(true)
    expect(command.alt).toEqual(false)
    expect(command.key).toEqual(key)

    expect(command.print()).toEqual(`Ctrl+Shift+${key}`)
  })

  it('should print Ctrl+Alt+Key value on call to ContextCommand print method when ContextCommand key has value and both control and alt are true', async () => {
    const command = new ContextCommand()
    command.control = true
    command.alt = true
    const key = 'Value'
    command.key = key

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(true)
    expect(command.shift).toEqual(false)
    expect(command.alt).toEqual(true)
    expect(command.key).toEqual(key)

    expect(command.print()).toEqual(`Ctrl+Alt+${key}`)
  })

  it('should print Shift+Alt+Key value on call to ContextCommand print method when ContextCommand key has value and both shift and alt are true', async () => {
    const command = new ContextCommand()
    command.shift = true
    command.alt = true
    const key = 'Value'
    command.key = key

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(false)
    expect(command.shift).toEqual(true)
    expect(command.alt).toEqual(true)
    expect(command.key).toEqual(key)

    expect(command.print()).toEqual(`Shift+Alt+${key}`)
  })

  it('should print Ctrl+Shift+Alt+Key value on call to ContextCommand print method when ContextCommand key has value and all control, shift, and alt are true', async () => {
    const command = new ContextCommand()
    command.control = true
    command.shift = true
    command.alt = true
    const key = 'Value'
    command.key = key

    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(true)
    expect(command.shift).toEqual(true)
    expect(command.alt).toEqual(true)
    expect(command.key).toEqual(key)

    expect(command.print()).toEqual(`Ctrl+Shift+Alt+${key}`)
  })

  it('should initalize factory holding ContextCommand when ContextCommandFactory objects are created', async () => {
    const factory = new ContextCommandFactory()

    expect(factory instanceof ContextCommandFactory).toEqual(true)
    expect(factory.command instanceof ContextCommand).toEqual(true)
    expect(factory.command.control).toEqual(false)
    expect(factory.command.shift).toEqual(false)
    expect(factory.command.alt).toEqual(false)
    expect(factory.command.key).toEqual('')
  })

  it('should set control flag on command ContextCommand member on call to ContextCommandFactory control method ', async () => {
    const factory = new ContextCommandFactory()

    expect(factory.command.control).toEqual(false)

    factory.control()

    expect(factory.command.control).toEqual(true)
  })

  it('should set shift flag on command ContextCommand member on call to ContextCommandFactory shift method ', async () => {
    const factory = new ContextCommandFactory()

    expect(factory.command.shift).toEqual(false)

    factory.shift()

    expect(factory.command.shift).toEqual(true)
  })

  it('should set alt flag on command ContextCommand member on call to ContextCommandFactory alt method ', async () => {
    const factory = new ContextCommandFactory()

    expect(factory.command.alt).toEqual(false)

    factory.alt()

    expect(factory.command.alt).toEqual(true)
  })

  it('should set key value on command ContextCommand member on call to ContextCommandFactory key method ', async () => {
    const factory = new ContextCommandFactory()

    expect(factory.command.key).toEqual('')

    const key = 'Value'
    factory.key(key)

    expect(factory.command.key).toEqual(key)
  })

  it('should return command ContextCommand member on call to ContextCommandFactory key method ', async () => {
    const factory = new ContextCommandFactory()

    expect(factory.command.key).toEqual('')

    const key = 'Value'
    const command = factory.key(key)

    expect(command).toEqual(factory.command)
  })

  it('should return factory holding ContextCommand with control set to true when on call to ContextCommand static control method', async () => {
    const factory = ContextCommand.control()

    expect(factory).not.toBeUndefined()
    expect(factory instanceof ContextCommandFactory).toEqual(true)
    expect(factory.command).not.toBeUndefined()
    expect(factory.command instanceof ContextCommand).toEqual(true)
    expect(factory.command.control).toEqual(true)
    expect(factory.command.shift).toEqual(false)
    expect(factory.command.alt).toEqual(false)
    expect(factory.command.key).toEqual('')
  })

  it('should return factory holding ContextCommand with alt set to true when on call to ContextCommand static alt method', async () => {
    const factory = ContextCommand.alt()

    expect(factory).not.toBeUndefined()
    expect(factory instanceof ContextCommandFactory).toEqual(true)
    expect(factory.command).not.toBeUndefined()
    expect(factory.command instanceof ContextCommand).toEqual(true)
    expect(factory.command.control).toEqual(false)
    expect(factory.command.shift).toEqual(false)
    expect(factory.command.alt).toEqual(true)
    expect(factory.command.key).toEqual('')
  })

  it('should return factory holding ContextCommand with shift set to true when on call to ContextCommand static shift method', async () => {
    const factory = ContextCommand.shift()

    expect(factory).not.toBeUndefined()
    expect(factory instanceof ContextCommandFactory).toEqual(true)
    expect(factory.command).not.toBeUndefined()
    expect(factory.command instanceof ContextCommand).toEqual(true)
    expect(factory.command.control).toEqual(false)
    expect(factory.command.shift).toEqual(true)
    expect(factory.command.alt).toEqual(false)
    expect(factory.command.key).toEqual('')
  })

  it('should return ContextCommand with key set to provided value when on call to ContextCommand static key method', async () => {
    const key = 'Value'
    const command = ContextCommand.key(key)

    expect(command).not.toBeUndefined()
    expect(command instanceof ContextCommand).toEqual(true)
    expect(command.control).toEqual(false)
    expect(command.shift).toEqual(false)
    expect(command.alt).toEqual(false)
    expect(command.key).toEqual(key)
  })
})
