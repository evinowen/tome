export default (store) => {
  store.watch((state) => state.files.tree?.timestamp || 0, () => {
    const tree = store.state.files.tree
    const files = tree.base.children

    const patterns = {
      readme: /^readme(\.md|\.txt)?$/i,
      license: /^license(\.md|\.txt)?$/i,
      authors: /^authors(\.md|\.txt)?$/i,
      contributors: /^contributors(\.md|\.txt)?$/i,
    }

    for (const file of files) {
      for (const type in patterns) {
        const regex = patterns[type]
        if (regex.test(file.name)) {
          store.commit('repository/metadata', { [type]: file.path })
        }
      }
    }
  })
}
