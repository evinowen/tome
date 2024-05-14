import actions from './actions'
import clipboard from './clipboard'
import file from './file'
import initalize from './initalize'
import log from './log'
import metadata from './metadata'
import path from './path'
import repository from './repository'
import ssl from './ssl'
import templates from './templates'
import window from './window'

export default function () {
  return {
    ...actions,
    ...clipboard,
    ...file,
    ...initalize,
    ...log,
    ...metadata,
    ...path,
    ...repository,
    ...ssl,
    ...templates,
    ...window,
  }
}
