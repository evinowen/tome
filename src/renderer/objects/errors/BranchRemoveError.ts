import { Result } from '@/api'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_error_store } from '@/store/modules/error'

export class BranchRemoveErrorFactory {
  static Unknown = (error) => `An unrecognized error occured: ${error}`
}

export const BranchRemoveErrorTitle = 'Branch: Unknown'
export function BranchNameErrorMessage (result) {
  switch (result.reason) {
    default:
      return BranchRemoveErrorFactory.Unknown(result.error)
  }
}

export default async function BranchRemoveError (result: Result) {
  if (result.success) {
    return false
  }

  const message = BranchNameErrorMessage(result)

  const error = fetch_error_store()
  const log = fetch_log_store()
  log.error(await error.show(BranchRemoveErrorTitle, message), `Error Code: ${result.code}`)

  return true
}
