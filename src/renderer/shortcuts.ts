export const map = {
  '`': { layer: 'console' },
  'e': { layer: 'edit' },
  's': { layer: 'commit' },
  'S': { perform: 'quick-commit' },
  'p': { layer: 'push' },
  'f': { layer: 'search' },
  'o': { dispatch: 'library/select' },
}

export const shortcuts = (key) => (map[key] ?? null)
