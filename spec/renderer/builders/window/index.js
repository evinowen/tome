import actions from './actions'
import clipboard from './clipboard'
import disk from './disk'
import dialog from './dialog'
import file from './file'
import git from './git'
import metadata from './metadata'
import path from './path'
import ssl from './ssl'
import templates from './templates'
import window from './window'

export default function (callable) {
  return {
    _: {
      ...disk,
      ...dialog
    },
    api: {
      ...actions,
      ...clipboard,
      ...file,
      ...git,
      ...metadata,
      ...path,
      ...ssl,
      ...templates,
      ...window
    }
  }
}
