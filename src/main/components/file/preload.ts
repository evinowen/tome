import invoker from '../invoke'
import subscriber from '../subscribe'

const invoke = invoker('file')
const subscribe = subscriber('file')

export default {
  subscribe: (path, listener) => subscribe('events')(path)(listener),
  clear_subscriptions: invoke('clear-subscriptions'),
  exists: invoke('exists'),
  is_directory: invoke('is-directory'),
  create: invoke('create'),
  create_directory: invoke('create-directory'),
  list_directory: invoke('list-directory'),
  contents: invoke('contents'),
  write: invoke('write'),
  write_library: invoke('write-library'),
  rename: invoke('rename'),
  open: invoke('open'),
  delete: invoke('delete'),
  select_directory: invoke('select-directory'),
  directory_list: invoke('directory-list'),
  search_path: invoke('search-path'),
  search_next: invoke('search-next')
}
