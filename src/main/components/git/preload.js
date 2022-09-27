const invoke = require('../invoke')('repository')

module.exports = {
  load_repository: invoke('load'),
  refresh_repository: invoke('refresh'),
  refresh_patches_repository: invoke('refresh-patches'),
  remote_repository: invoke('remote'),
  inspect_repository: invoke('inspect'),
  diff_path_repository: invoke('diff-path'),
  diff_commit_repository: invoke('diff-commit'),
  credential_repository: invoke('credential'),
  stage_repository: invoke('stage'),
  reset_repository: invoke('reset'),
  push_repository: invoke('push'),
  clear_remote_repository: invoke('clear-remote'),
  load_remote_url_repository: invoke('load-remote-url'),
  commit_repository: invoke('commit')
}
