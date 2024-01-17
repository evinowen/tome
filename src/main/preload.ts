import { contextBridge, ipcRenderer } from 'electron'

const invoker = (namespace) => (channel) => (...parameters) => ipcRenderer.invoke([namespace, channel].join('-'), ...parameters)
const subscriber = (namespace) => (channel) => (...parameters) => (listener) => {
  const named_channel = [namespace, channel].join('-')
  const named_channel_return = [named_channel, 'return'].join('-')
  ipcRenderer.send(named_channel, named_channel_return, ...parameters)
  ipcRenderer.on(named_channel_return, listener)
}

const invoke = {
  action: invoker('action'),
  clipboard: invoker('clipboard'),
  repository: invoker('repository'),
  file: invoker('file'),
  app: invoker('app'),
  path: invoker('path'),
  ssl: invoker('ssl'),
  template: invoker('template'),
  window: invoker('window'),
}

const subscribe = {
  file: subscriber('file'),
}

export const log = {
  info: (message) => {
    ipcRenderer.send('__ELECTRON_LOG__', {
      data: [message],
      level: 'info',
    })
  },
  error: (message) => {
    ipcRenderer.send('__ELECTRON_LOG__', {
      data: [message],
      level: 'error',
    })
  }
}

export const action = {
  invoke: invoke.action('invoke'),
}

export const clipboard = {
  writetext: invoke.clipboard('writetext'),
  readtext: invoke.clipboard('readtext'),
  paste: invoke.clipboard('paste'),
}

export const repository = {
  load: invoke.repository('load'),
  refresh: invoke.repository('refresh'),
  refresh_patches: invoke.repository('refresh-patches'),
  remote: invoke.repository('remote'),
  inspect: invoke.repository('inspect'),
  diff_path: invoke.repository('diff-path'),
  diff_commit: invoke.repository('diff-commit'),
  credential: invoke.repository('credential'),
  stage: invoke.repository('stage'),
  reset: invoke.repository('reset'),
  push: invoke.repository('push'),
  clear_remote: invoke.repository('clear-remote'),
  load_remote_url: invoke.repository('load-remote-url'),
  commit: invoke.repository('commit'),
}

export const file = {
  subscribe: (path, listener) => subscribe.file('events')(path)(listener),
  clear_subscriptions: invoke.file('clear-subscriptions'),
  exists: invoke.file('exists'),
  is_directory: invoke.file('is-directory'),
  create: invoke.file('create'),
  create_directory: invoke.file('create-directory'),
  list_directory: invoke.file('list-directory'),
  contents: invoke.file('contents'),
  write: invoke.file('write'),
  write_library: invoke.file('write-library'),
  rename: invoke.file('rename'),
  open: invoke.file('open'),
  delete: invoke.file('delete'),
  select_directory: invoke.file('select-directory'),
  directory_list: invoke.file('directory-list'),
  search_path: invoke.file('search-path'),
  search_next: invoke.file('search-next'),
}

export const app = {
  getPath: invoke.app('getPath'),
  getVersion: invoke.app('getVersion'),
  getProcess: invoke.app('getProcess'),
}

export const path = {
  basename: invoke.path('basename'),
  dirname: invoke.path('dirname'),
  extension: invoke.path('extension'),
  join: (...targets) => invoke.path('join')(targets),
  relative: invoke.path('relative'),
  sep: invoke.path('sep'),
}

export const ssl = {
  generate_public_key: invoke.ssl('generate-public-key'),
  generate_private_key: invoke.ssl('generate-private-key'),
}

export const template = {
  invoke: invoke.template('invoke'),
}

export const window = {
  is_maximized: invoke.window('is-maximized'),
  restore: invoke.window('restore'),
  maximize: invoke.window('maximize'),
  minimize: invoke.window('minimize'),
  close: invoke.window('close'),
}

contextBridge.exposeInMainWorld('api', {
  log,
  action,
  clipboard,
  repository,
  file,
  app,
  path,
  ssl,
  template,
  window,
})
