import { contextBridge } from 'electron'
import actions from './components/actions/preload'
import clipboard from './components/clipboard/preload'
import repository from './components/repository/preload'
import file from './components/file/preload'
import app from './components/metadata/preload'
import path from './components/path/preload'
import ssl from './components/ssl/preload'
import templates from './components/templates/preload'
import window from './components/window/preload'

contextBridge.exposeInMainWorld('api', {
  actions,
  clipboard,
  repository,
  file,
  app,
  path,
  ssl,
  templates,
  window
})
1