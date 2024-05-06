import ContextItem from './ContextItem'

export default class ContextSection {
  items: ContextItem[] = []

  add (condition, item: ContextItem) {
    if (condition) {
      this.items.push(item)
    }

    return this
  }
}
