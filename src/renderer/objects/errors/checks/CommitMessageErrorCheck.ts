import { fetch_error_store } from '@/store/modules/error'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'

export default async function CommitMessageErrorCheck () {
  const error = fetch_error_store()
  const repository_committer = fetch_repository_committer_store()

  if (repository_committer.error.message) {
    await error.show(
      'Commit Error: Message',
      'The commit requires a commit message.',
      'commit-error-message',
    )

    return true
  }

  return false
}
