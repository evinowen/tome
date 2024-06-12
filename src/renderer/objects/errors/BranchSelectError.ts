import { Result } from '@/api'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_option_store } from '@/store/modules/option'
import { fetch_error_store } from '@/store/modules/error'
import { fetch_system_store } from '@/store/modules/system'

export class BranchSelectErrorFactory {
  static Conflict = (name) => `A conflict exists preventing checkout of branch "${name}".`
  static Unknown = (name, error) => `An unrecognized error occured for name "${name}": ${error}`
}

export const BranchSelectErrorTitle = 'Branch: Select'
export function BranchSelectErrorMessage (result, name) {
  switch (result.reason) {
    case 'conflict':
      return BranchSelectErrorFactory.Conflict(name)

    default:
      return BranchSelectErrorFactory.Unknown(name, result.error)
  }
}

export default async function BranchSelectError (result: Result, name: string) {
  if (result.success) {
    return false
  }

  const message = BranchSelectErrorMessage(result, name)

  const error = fetch_error_store()
  const log = fetch_log_store()
  log.error(await error.show(BranchSelectErrorTitle, message), `Error Code: ${result.code}`)

  if (result.reason === 'conflict') {
    const option = fetch_option_store()
    await option.show(
      BranchSelectErrorTitle,
      `A conflict exists preventing checkout of branch "${name}".`,
      'Would you like to create a commit so this branch can be selected?',
      async () => {
        const system = fetch_system_store()
        await system.page({ commit: true })
      },
    )
  }

  return true
}
