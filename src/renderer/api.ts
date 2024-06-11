export interface API {
  initalize: {
    load: () => void
    ready: () => void
  }

  log: {
    configure: (log_level: string) => void

    trace: (message: string) => void
    debug: (message: string) => void
    info: (message: string) => void
    warn: (message: string) => void
    error: (message: string) => void
    fatal: (message: string) => void
  }
  action: {
    invoke: (source: string, target: string, selection: string)
    => Promise<{ success: boolean, message: string, selection: string }>
  }
  clipboard: {
    writetext: (text: string) => Promise<void>
    readtext: () => Promise<string>
    paste: (action: string, source: string, target: string) => Promise<void>
  }
  file: {
    subscribe: (target: string, listener: (data: { event: string, path: string }) => void) => Promise<void>
    clear_subscriptions: () => Promise<void>
    exists: (target: string) => Promise<boolean>
    is_directory: (target: string) => Promise<boolean>
    create: (target: string) => Promise<boolean>
    create_directory: (target: string) => Promise<boolean>
    list_directory: (target: string) => Promise<{ name: string, mime: string, directory: boolean }[]>
    contents: (target: string) => Promise<string>
    write: (target: string, content: string) => Promise<void>
    write_library: (target: string, items: string[]) => Promise<void>
    rename: (target: string, proposed: string) => Promise<void>
    open: (target: string, container: boolean) => Promise<void>
    delete: (target: string) => Promise<void>
    select_directory: () => Promise<{ canceled: boolean, filePaths: string[] }>
    directory_list: (target: string) => Promise<string[]>
    search_path: (target: string, criteria: SearchCriteria) => Promise<void>
    search_next: () => Promise<SearchResult>
  }
  app: {
    getPath: (name: string) => Promise<string>
    getVersion: () => Promise<string>
    getProcess: () => Promise<{ process: unknown, sandboxed: boolean }>
  }
  path: {
    basename: (query: string) => Promise<string>
    dirname: (query: string) => Promise<string>
    extension: (query: string) => Promise<string>
    join: (...targets: string[]) => Promise<string>
    relative: (base: string, query: string) => Promise<string>
    sep: () => Promise<string>
  }
  repository: {
    commit: (name: string, email: string, message: string) => Promise<void>
    credential_key: (private_key: string, public_key: string, passphrase: string) => Promise<void>
    credential_password: (username: string, password: string) => Promise<void>
    diff_commit: (commit: string) => Promise<{ patches: RepositoryPatch[], message: string, signature: string }>
    diff_path: (path: string) => Promise<{ patches: RepositoryPatch[] }>
    inspect: () => Promise<{ available: RepositoryFile[], staged: RepositoryFile[] }>
    load: (path: string) => Promise<{ name: string, path: string }>
    push: () => Promise<void>
    refresh: () => Promise<void>
    branch_status: () => Promise<{ active: string, list: RepositoryBranch[] }>
    branch_create: (name: string) => Promise<Result>
    branch_select: (name: string) => Promise<Result>
    branch_rename: (name: string, value: string) => Promise<Result>
    branch_remove: (name: string) => Promise<Result>
    remote_add: (name: string, url: string) => Promise<void>
    remote_clear: () => Promise<void>
    remote_list: () => Promise<RepositoryRemote[]>
    remote_load: (name: string) => Promise<{ error?: string, success: true }>
    remote_remove: (name: string) => Promise<void>
    remote_status: () => Promise<RepositoryRemote>
    reset: (query: string) => Promise<void>
    stage: (query: string) => Promise<void>
    history_list: (page: number) => Promise<RepositoryHistoricalCommit[]>
    history_clear: () => Promise<void>
    tag_list: () => Promise<{ list: RepositoryTag[] }>
    tag_create: (name: string, oid: string) => Promise<void>
    tag_remove: (name: string) => Promise<void>
  }
  ssl: {
    generate_public_key: (target: string, passphrase?: string) => Promise<{ error?: string, path?: string, data?: string }>
    generate_private_key: (passphrase?: string) => Promise<{ error?: string, path?: string, data?: string }>
  }
  template: {
    invoke: (source: string, target: string) => Promise<{ success: boolean, result: string }>
  }
  window: {
    is_maximized: () => Promise<boolean>
    restore: () => Promise<void>
    maximize: () => Promise<void>
    minimize: () => Promise<void>
    close: () => Promise<void>
  }
}

export interface Result {
  error?: string
  reason?: string
  code?: number
  success?: true
}

export interface SearchCriteria {
  query: string
  multifile: boolean
  regex_query: boolean
  case_sensitive: boolean
}

export interface SearchResult {
  path: undefined | {
    absolute: string
    relative: string
    matched: number
  }
  directory: boolean
  matches: { index: number, line: string }[]
}

export interface RepositoryCommit {
  oid: string
  date: Date
  message: string
}

export interface RepositoryFile {
  path: string
  type: number
}

export interface RepositoryBranch {
  reference: string
  name: string
  updated: Date
}

export interface RepositoryTag {
  name: string
  oid: string
  date: Date
}

export interface RepositoryRemote {
  error?: string
  name?: string
  url?: string
  branch?: RepositoryRemoteBranch
  pending?: RepositoryCommit[]
}

export interface RepositoryRemoteBranch {
  name: string
  short: string
}

export interface RepositoryMetadata {
  name: string
  path: string
  history: { oid: string, date: Date, message: string }[]
  branch?: string
  remotes: { name: string, url: string }[]
  available: RepositoryFile[]
  staged: RepositoryFile[]
}

export interface RepositoryPatch {
  name: string
  path: string
  lines: RepositoryPatchLine[]
}

export interface RepositoryPatchLine {
  type: number
  line: string
}

export interface RepositoryHistoricalCommit {
  oid: string
  date: Date
  message: string
  root: boolean
}

export const request = () => window.api as API

export default request()
