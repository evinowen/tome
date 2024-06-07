import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import CommitSignatureErrorCheck from './checks/CommitSignatureErrorCheck'
import CommitMessageErrorCheck from './checks/CommitMessageErrorCheck'

export default async function CommitError () {
  const repository_committer = fetch_repository_committer_store()
  await repository_committer.check()

  if (await CommitSignatureErrorCheck()) {
    return true
  }

  if (await CommitMessageErrorCheck()) {
    return true
  }

  return false
}
