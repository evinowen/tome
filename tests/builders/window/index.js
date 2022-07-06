import clipboard from './clipboard'
import disk from './disk'
import dialog from './dialog'
import file from './file'
import git from './git'
import path from './path'
import window from './window'

export default function (callable) {
  return {
    _: {
      ...disk,
      ...dialog
    },
    api: {
      ...clipboard,
      ...file,
      ...git,
      ...path,
      ...window
    }
  }
}
