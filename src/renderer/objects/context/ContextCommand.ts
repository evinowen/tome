export class ContextCommandFactory {
  command: ContextCommand = new ContextCommand()

  control () {
    this.command.control = true
    return this
  }

  alt () {
    this.command.alt = true
    return this
  }

  shift () {
    this.command.shift = true
    return this
  }

  key (key: string) {
    this.command.key = key
    return this.command
  }
}

export default class ContextCommand {
  control: boolean
  alt: boolean
  shift: boolean
  key: string

  constructor () {
    this.control = false
    this.alt = false
    this.shift = false
    this.key = ''
  }

  print () {
    const parts = []

    if (this.control) {
      parts.push('Ctrl')
    }

    if (this.shift) {
      parts.push('Shift')
    }

    if (this.alt) {
      parts.push('Alt')
    }

    if (this.key) {
      parts.push(this.key)
    }

    return parts.join('+')
  }

  static control () {
    return (new ContextCommandFactory()).control()
  }

  static alt () {
    return (new ContextCommandFactory()).alt()
  }

  static shift () {
    return (new ContextCommandFactory()).shift()
  }

  static key (key: string) {
    return (new ContextCommandFactory()).key(key)
  }
}
