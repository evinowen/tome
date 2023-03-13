import { contextBridge } from 'electron'
import * as log from 'electron-log'
import action from './components/actions/preload'
import clipboard from './components/clipboard/preload'
import repository from './components/repository/preload'
import file from './components/file/preload'
import app from './components/metadata/preload'
import path from './components/path/preload'
import ssl from './components/ssl/preload'
import template from './components/templates/preload'
import window from './components/window/preload'

contextBridge.exposeInMainWorld('api', {
  log: log.functions,
  action,
  clipboard,
  repository,
  file,
  app,
  path,
  ssl,
  template,
  window
})
