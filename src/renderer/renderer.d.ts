interface SearchCriteria {
  query: string,
  multifile: boolean,
  regex_query: boolean,
  case_sensitive: boolean
}

interface SearchResult {
  path: undefined|{
    absolute: string,
    relative: string,
    matched: number
  },
  directory: boolean,
  matches: { index: number, line: string }[]
}

interface RepositoryMetadata {
  name: string,
  path: string,
  history: { oid: string, date: Date, message: string }[],
  branch?: string,
  remotes: { name: string, url: string }[],
  available: { path: string, type: number }[],
  staged: { path: string, type: number }[]
}

export interface API {
  action: {
    invoke: (source: string, target: string, selection: string)
      => Promise<{ success: boolean, message: string, selection: string }>
  },
  clipboard: {
    writetext: (text: string) => Promise<void>,
    readtext: () => Promise<string>,
    paste: (action: string, source: string, target: string) => Promise<void>
  },
  file: {
    subscribe: (target: string, listener: (data: {event: string, path: string}) => void) => Promise<void>,
    clear_subscriptions: () => Promise<void>,
    exists: (target: string) => Promise<boolean>,
    is_directory: (target: string) => Promise<boolean>,
    create: (target: string) => Promise<boolean>,
    create_directory: (target: string) => Promise<boolean>,
    list_directory: (target: string) => Promise<{ name: string, mime: string, directory: boolean }[]>,
    contents: (target: string) => Promise<string>,
    write: (target: string, content: string) => Promise<void>,
    write_library: (target: string, items: string[]) => Promise<void>,
    rename: (target: string, proposed: string) => Promise<void>,
    open: (target: string, container: boolean) => Promise<void>,
    delete: (target: string) => Promise<void>,
    select_directory: () => Promise<{ canceled: boolean, filePaths: string[] }>,
    directory_list: (target: string) => Promise<string[]>,
    search_path: (target: string, criteria: SearchCriteria) => Promise<void>,
    search_next: () => Promise<SearchResult>
  },
  app: {
    getPath: (name: string) => Promise<string>,
    getVersion: () => Promise<string>,
    getProcess: () => Promise<{ process: unknown, sandboxed: boolean}>
  },
  path: {
    basename: (query: string) => Promise<string>,
    dirname: (query: string) => Promise<string>,
    extension: (query: string) => Promise<string>,
    join: (...targets: string[]) => Promise<string>,
    relative: (base: string, query: string) => Promise<string>,
    sep: () => Promise<string>
  },
  repository: {
    load: (path: string) => Promise<{ name: string, path: string, history: string, branch: string, remotes: string, available: string, staged: string }>,
    refresh: () => Promise<void>,
    refresh_patches: () => Promise<void>,
    remote: () => Promise<void>,
    inspect: () => Promise<void>,
    diff_path: (path: string) => Promise<void>,
    diff_commit: (commit: string) => Promise<void>,
    credential: (private_key: string, public_key: string, passphrase: string) => Promise<void>,
    stage: (query: string) => Promise<void>,
    reset: (query: string) => Promise<void>,
    push: () => Promise<void>,
    clear_remote: () => Promise<void>,
    load_remote_url: (url: string) => Promise<void>,
    commit: (name: string, email: string, message: string) => Promise<void>
  },
  ssl: {
    generate_public_key: (target: string, passphrase?: string) => Promise<{ path: string, data: string }>,
    generate_private_key: (passphrase?: string) => Promise<{ path: string, data: string }>
  },
  template: {
    invoke: (source: string, target: string) => Promise<{ success: boolean, result: string }>
  },
  window: {
    is_maximized: () => Promise<boolean>,
    restore: () => Promise<void>,
    maximize: () => Promise<void>,
    minimize: () => Promise<void>,
    close: () => Promise<void>
  }
}

declare global {
  interface Window {
    api: API
  }
}
