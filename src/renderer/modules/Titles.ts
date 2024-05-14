export function format (name, directory = false) {
  if (!name) {
    throw new Error('Name provided is falsey')
  }

  if (/[^\d.a-z-]/.test(name)) {
    throw new Error('Name contains invalid characters')
  }

  const words = String(name).split('.')

  if (words.length > 0 && !directory) {
    words.pop()
  }

  return words.map((item) => `${String(item).slice(0, 1).toUpperCase()}${item.slice(1)}`).join(' ').trim()
}
