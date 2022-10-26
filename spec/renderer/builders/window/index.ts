import actions from './actions'
import clipboard from './clipboard'
import file from './file'
import repository from './repository'
import metadata from './metadata'
import path from './path'
import ssl from './ssl'
import templates from './templates'
import window from './window'

export default function () {
  return {
    api: {
      ...actions,
      ...clipboard,
      ...file,
      ...repository,
      ...metadata,
      ...path,
      ...ssl,
      ...templates,
      ...window
    }
  }
}
