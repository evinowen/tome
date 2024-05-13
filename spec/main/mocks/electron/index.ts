import { jest } from '@jest/globals'
import { IpcListener, IpcMainInvokeEvent, ipcMainListenerMap, ipcRendererListenerMap } from '?/meta/electron'

const AppListeners = new Map<{ app: App, event: string }, () => void>()
export function ExecAppEvent (app, event) {
  const listener = AppListeners.get({ app, event })
  listener()
}

const AppGetPath = jest.fn((name: string): string | undefined => {
  const home = '/home/user'

  switch (name) {
    case 'appData': {
      return `${home}/.config`
    }

    case 'userData': {
      return `${AppGetPath('appData')}/tome`
    }
  }
})

export class App {
  quit () {}

  async whenReady () {}

  on (event: string, listener: () => void): App {
    AppListeners.set({ app: this, event }, listener)

    return this
  }

  getPath = AppGetPath
}

export class WebContents {
  openDevTools () {}
  // eslint-disable-next-line unicorn/prevent-abbreviations, @typescript-eslint/no-explicit-any
  send (channel, ...args: any[]) {
    ipcRendererListenerMap.get(channel)({} as IpcMainInvokeEvent, ...args)
  }
}

export class BrowserWindowMock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: { [key: string]: any }
  webContents: WebContents

  constructor (options) {
    this.options = options
    this.webContents = new WebContents()
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  loadFile = jest.fn(async () => {
    ipcRenderer.send('initalize-ready')
  })

  // eslint-disable-next-line unicorn/consistent-function-scoping
  loadURL = jest.fn(async () => {
    ipcRenderer.send('initalize-ready')
  })

  show () {}
}

export const BrowserWindow = jest.fn((options) => new BrowserWindowMock(options))

export const ipcMain = {
  handle: jest.fn((channel: string, listener: IpcListener) => ipcMainListenerMap.set(channel, listener)),
  on: jest.fn((channel: string, listener: IpcListener) => ipcMainListenerMap.set(channel, listener)),
  removeHandler: jest.fn(),
}

export const ipcRenderer = {
  // eslint-disable-next-line unicorn/prevent-abbreviations, @typescript-eslint/no-explicit-any
  invoke: jest.fn((channel: string, ...args: any[]) => ipcMainListenerMap.get(channel)({} as IpcMainInvokeEvent, ...args)),
  on: jest.fn((channel: string, listener: IpcListener) => ipcRendererListenerMap.set(channel, listener)),
  // eslint-disable-next-line unicorn/prevent-abbreviations, @typescript-eslint/no-explicit-any
  send: jest.fn((channel: string, ...args: any[]) => ipcMainListenerMap.get(channel)({} as IpcMainInvokeEvent, ...args)),
}

export const contextBridge = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  exposeInMainWorld: jest.fn((api_key: string, api: any) => {}),
}
export const dialog = {
  showOpenDialog: jest.fn(),
}

export const shell = {
  openPath: jest.fn(),
}

export const clipboard = {
  writeText: jest.fn(),
  readText: jest.fn(),
}

export const app = new App()

export const CrossProcessExports = {
  app,
  BrowserWindow,
}
