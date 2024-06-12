export const map = {
  '`': { layer: 'console' },
  'e': { layer: 'edit' },
  's': { layer: 'commit' },
  'S': { perform: 'quick-commit' },
  'p': { layer: 'push' },
  'f': { layer: 'search' },
}

export const shortcuts = (key) => (map[key] ?? undefined)
