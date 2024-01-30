import { jest } from '@jest/globals'

export const mocked_references = [
  {
    name: jest.fn(() => 'refs/heads/master'),
    oid: jest.fn(),
  },
]

export const mocked_remote = {
  name: jest.fn(() => ''),
  url: jest.fn(() => 'git@git.example.com:remote.git'),
  connect: jest.fn(),
  referenceList: jest.fn(() => mocked_references),
  push: jest.fn(),
}

export const mocked_remotes = [
  mocked_remote,
]

export const mocked_branch = {
  shorthand: jest.fn(() => 'master'),
}

export const mocked_tree = {
  diff: jest.fn(() => mocked_diff),
}

export const mocked_commit_id = {
  cmp: jest.fn(() => 0),
  tostrS: jest.fn(() => '1234'),
}

export const mocked_commit = {
  id: jest.fn(() => mocked_commit_id),
  date: jest.fn(),
  message: jest.fn(() => 'Commit Message'),
  parentcount: jest.fn(() => 0),
  parent: jest.fn(),
  getParents: jest.fn(() => [ mocked_commit ]),
  getTree: jest.fn(() => mocked_tree),
}

export const mocked_repository_index = {
  addByPath: jest.fn(),
  removeByPath: jest.fn(),
  write: jest.fn(),
  writeTree: jest.fn(),
}

export const mocked_repository_status = [
  {
    path: jest.fn(() => './first_file'),
    isNew: jest.fn(() => true),
    isModified: jest.fn(() => false),
    isRenamed: jest.fn(() => false),
    isDeleted: jest.fn(() => false),
  },
  {
    path: jest.fn(() => './second_file'),
    isNew: jest.fn(() => false),
    isModified: jest.fn(() => true),
    isRenamed: jest.fn(() => false),
    isDeleted: jest.fn(() => false),
  },
  {
    path: jest.fn(() => './third_file'),
    isNew: jest.fn(() => false),
    isModified: jest.fn(() => false),
    isRenamed: jest.fn(() => true),
    isDeleted: jest.fn(() => false),
  },
  {
    path: jest.fn(() => './fourth_file'),
    isNew: jest.fn(() => false),
    isModified: jest.fn(() => false),
    isRenamed: jest.fn(() => false),
    isDeleted: jest.fn(() => true),
  },
]

export const mocked_repository = {
  headDetached: jest.fn(() => 0),
  headUnborn: jest.fn(() => 0),
  isMerging: jest.fn(() => false),
  isRebasing: jest.fn(() => false),
  head: jest.fn(() => mocked_branch),
  createCommit: jest.fn(),
  getCommit: jest.fn(() => mocked_commit),
  getBranchCommit: jest.fn(() => mocked_commit),
  getReferenceCommit: jest.fn(() => mocked_commit),
  getRemotes: jest.fn(() => mocked_remotes),
  getStatus: jest.fn(() => Promise.resolve(mocked_repository_status)),
  refreshIndex: jest.fn(() => mocked_repository_index),
}

export const mocked_patches = [ {}, {}, {} ]

export const mocked_diff = {
  patches: jest.fn(() => mocked_patches),
}

export const Cred = {
  sshKeyNew: jest.fn((username, public_key, private_key, passphrase) => ({
    username, public_key, private_key, passphrase,
  })),
}

export const Diff = {
  treeToWorkdir: jest.fn(() => mocked_diff),
  LINE: {
    HUNK_HDR: 72,
    ADDITION: 1,
    DELETION: 2,
    CONTEXT: 3,
  },
  OPTION: {
    DISABLE_PATHSPEC_MATCH: 0,
    INCLUDE_UNREADABLE: 0,
    INCLUDE_UNTRACKED: 0,
    RECURSE_UNTRACKED_DIRS: 0,
  },
}

export const DiffOptions = {}

export const Enums = {
  DIRECTION: {
    FETCH: 0,
  },
}

export const Reset = {
  default: jest.fn(),
}

export const Reference = {
  nameToId: jest.fn(() => mocked_branch),
}

export const Repository = {
  open: jest.fn(() => mocked_repository),
  init: jest.fn(() => mocked_repository),
}

export const Signature = {
  now: jest.fn(() => ({})),
}

export const Status = {
  SHOW: {
    INDEX_AND_WORKDIR: 0,
    INDEX_ONLY: 1,
    WORKDIR_ONLY: 2,
  },
  OPT: {
    INCLUDE_UNTRACKED: 1,
    INCLUDE_IGNORED: 2,
    INCLUDE_UNMODIFIED: 4,
    EXCLUDE_SUBMODULES: 8,
    RECURSE_UNTRACKED_DIRS: 16,
    DISABLE_PATHSPEC_MATCH: 32,
    RECURSE_IGNORED_DIRS: 64,
    RENAMES_HEAD_TO_INDEX: 128,
    RENAMES_INDEX_TO_WORKDIR: 256,
    SORT_CASE_SENSITIVELY: 512,
    SORT_CASE_INSENSITIVELY: 1024,
    RENAMES_FROM_REWRITES: 2048,
    NO_REFRESH: 4096,
    UPDATE_INDEX: 8192,
    INCLUDE_UNREADABLE: 16_384,
    INCLUDE_UNREADABLE_AS_UNTRACKED: 32_768,
  },
}

export const StatusOptions = {}
