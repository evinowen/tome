function Template<State> () {
  return {
    mutations: <MutationTree<State>>{
      update: (state, data) => {
        for (const key in data) {
          Reflect.set(state, key, data[key])
        }
      },
    },
    actions: <ActionTree<State, unknown>>{
      hydrate: async (context, data) => {
        for (const index in data) {
          const datum = data[index]
          if (datum instanceof Object) {
            await context.dispatch(`${index}/hydrate`, datum)
          } else {
            context.commit('update', { [index]: datum })
          }
        }
      },
      update: async (context, data) => {
        context.commit('update', data)
        await context.dispatch('configuration/present', undefined, { root: true })
        await context.dispatch('configuration/write', undefined, { root: true })
      },
    },
  }
}

export default Template
