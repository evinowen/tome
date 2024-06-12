import { Result } from '@/api'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_error_store } from '@/store/modules/error'

export class BranchNameErrorFactory {
  static Exists = (name) => `The branch name "${name}" in already in use by another branch.`
  static Invalid = (name) => `The branch name "${name}" is not a valid branch name.`
  static Unknown = (name, error) => `An unrecognized error occured for name "${name}": ${error}`
}

export const BranchNameErrorTitle = 'Branch: Unknown'
export function BranchNameErrorMessage (result, name) {
  switch (result.reason) {
    case 'exists':
      return BranchNameErrorFactory.Exists(name)

    case 'invalid':
      return BranchNameErrorFactory.Invalid(name)

    default:
      return BranchNameErrorFactory.Unknown(name, result.error)
  }
}

export default async function BranchNameError (result: Result, name: string) {
  if (result.success) {
    return false
  }

  const message = BranchNameErrorMessage(result, name)

  const error = fetch_error_store()
  const log = fetch_log_store()
  log.error(await error.show(BranchNameErrorTitle, message), `Error Code: ${result.code}`)

  return true
}
