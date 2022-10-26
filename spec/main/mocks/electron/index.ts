export const __ = {
  enabled_callbacks: []
}

export class App {
  async on (type, callback) {
    if (!__.enabled_callbacks.includes(type)) {
      return
    }

    await callback()
  }

  quit () {}
  whenReady () {}
}

export class WebContents {
  openDevTools () {}
}

export class BrowserWindow {
  constructor (options) {
    if (options.webPreferences.preload) {
      require(options.webPreferences.preload)
    }
  }

  static getAllWindows () {}

  loadFile () {}
  loadURL () {}
  show () {}
  async on (type, callback) {
    const skip = new Set(['closed'])
    if (skip.has(type)) {
      return
    }

    await callback()
  }

  webContents = new WebContents()
}

const app = new App

export default {
  __,
  app,
  BrowserWindow
}