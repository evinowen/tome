import { fetch_error_store } from '@/store/modules/error'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'

export default async function CommitSignatureErrorCheck () {
  const error = fetch_error_store()
  const repository_committer = fetch_repository_committer_store()

  const message = []
  if (repository_committer.error.name) {
    message.push('Name')
  }

  if (repository_committer.error.email) {
    message.push('E-Mail Address')
  }

  if (message.length === 0) {
    return false
  }

  await error.show(
    'Commit Error: Signature',
    `Incomplete commit signature, missing valid ${message.join(' and ')}.`,
    'commit-error-signature',
  )

  return true
}
