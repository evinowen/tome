import { contextBridge, ipcRenderer } from 'electron'

const alerter = (namespace) => (channel) => (...parameters) => {
  ipcRenderer.send([ namespace, channel ].join('-'), ...parameters)
}
const invoker = (namespace) => (channel) => (...parameters) => ipcRenderer.invoke([ namespace, channel ].join('-'), ...parameters)
const subscriber = (namespace) => (channel) => (...parameters) => (listener) => {
  const named_channel = [ namespace, channel ].join('-')
  const named_channel_return = [ named_channel, 'return' ].join('-')
  ipcRenderer.send(named_channel, named_channel_return, ...parameters)
  ipcRenderer.on(named_channel_return, listener)
}

const alert = {
  initalize: alerter('initalize'),
  log: alerter('log'),
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

export const initalize = {
  load: alert.initalize('load'),
  ready: alert.initalize('ready'),
}

export const log = {
  configure: alert.log('configure'),

  trace: alert.log('trace'),
  debug: alert.log('debug'),
  info: alert.log('info'),
  warn: alert.log('warn'),
  error: alert.log('error'),
  fatal: alert.log('fatal'),
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
  commit: invoke.repository('commit'),
  credential_key: invoke.repository('credential-key'),
  credential_password: invoke.repository('credential-password'),
  diff_commit: invoke.repository('diff-commit'),
  diff_path: invoke.repository('diff-path'),
  inspect: invoke.repository('inspect'),
  load: invoke.repository('load'),
  push: invoke.repository('push'),
  refresh: invoke.repository('refresh'),
  branch_status: invoke.repository('branch-status'),
  branch_create: invoke.repository('branch-create'),
  branch_select: invoke.repository('branch-select'),
  branch_rename: invoke.repository('branch-rename'),
  branch_remove: invoke.repository('branch-remove'),
  remote_add: invoke.repository('remote-add'),
  remote_clear: invoke.repository('remote-clear'),
  remote_list: invoke.repository('remote-list'),
  remote_load: invoke.repository('remote-load'),
  remote_remove: invoke.repository('remote-remove'),
  remote_status: invoke.repository('remote-status'),
  reset: invoke.repository('reset'),
  stage: invoke.repository('stage'),
  history_list: invoke.repository('history-list'),
  tag_list: invoke.repository('tag-list'),
  tag_create: invoke.repository('tag-create'),
  tag_remove: invoke.repository('tag-remove'),
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
  initalize,
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
