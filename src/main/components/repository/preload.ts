import invoker from '../invoke'

const invoke = invoker('repository')

export default {
  load: invoke('load'),
  refresh: invoke('refresh'),
  refresh_patches: invoke('refresh-patches'),
  remote: invoke('remote'),
  inspect: invoke('inspect'),
  diff_path: invoke('diff-path'),
  diff_commit: invoke('diff-commit'),
  credential: invoke('credential'),
  stage: invoke('stage'),
  reset: invoke('reset'),
  push: invoke('push'),
  clear_remote: invoke('clear-remote'),
  load_remote_url: invoke('load-remote-url'),
  commit: invoke('commit')
}
