const invoke = require('../invoke')('file')
const subscribe = require('../subscribe')('file')

module.exports = {
  file: {
    subscribe: (path, listener) => subscribe('events')(path)(listener),
    clear_subscriptions: invoke('clear-subscriptions'),
    exists: invoke('exists'),
    is_directory: invoke('is-directory'),
    create: invoke('create'),
    create_directory: invoke('create-directory'),
    list_directory: invoke('list-directory'),
    contents: invoke('contents'),
    write: invoke('write'),
    rename: invoke('rename'),
    open: invoke('open'),
    delete: invoke('delete'),
    select_directory: invoke('select-directory'),
    directory_list: invoke('directory-list'),
    search_path: invoke('search-path'),
    search_next: invoke('search-next')
  }
}
