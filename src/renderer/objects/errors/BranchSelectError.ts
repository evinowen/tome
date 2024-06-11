import { Result } from '@/api'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_option_store } from '@/store/modules/option'
import { fetch_error_store } from '@/store/modules/error'
import { fetch_system_store } from '@/store/modules/system'

export default async function BranchSelectError (result: Result, name: string) {
  if (result.success) {
    return false
  }

  const error = fetch_error_store()
  const option = fetch_option_store()
  let message = ''

  switch (result.reason) {
    case 'conflict': {
      message = await option.show(
        'Branch: Conflict',
        `A conflict exists preventing checkout of branch "${name}".`,
        'Would you like to create a commit so this branch can be selected?',
        async () => {
          const system = fetch_system_store()
          await system.page({ commit: true })
        },
      )
      break
    }

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
