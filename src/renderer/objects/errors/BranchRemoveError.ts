import { Result } from '@/api'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_error_store } from '@/store/modules/error'

export default async function BranchRemoveError (result: Result) {
  if (result.success) {
    return false
  }

  const error = fetch_error_store()
  let message = ''

  switch (result.reason) {
    case 'unknown': {
      message = await error.show(
        'Branch: Unknown',
        `An unrecognized error occured: ${result.error}`,
      )
      break
    }
  }

  const log = fetch_log_store()
  log.error(message, `Error Code: ${result.code}`)

  return true
}
