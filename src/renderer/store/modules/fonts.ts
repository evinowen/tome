import { MutationTree, ActionTree } from 'vuex'

interface FontFamily {
  fonts: FontData[]
}

export interface State {
  library: Map<string, FontFamily>
  families: string[]
}

export const StateDefaults = (): State => ({
  library: new Map<string, FontFamily>(),
  families: [],
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    clear: function (state) {
      state.library.clear()
    },
    load: function (state, fonts: FontData[]) {
      for (const font of fonts) {
        let font_family = state.library.get(font.family)
        if (font_family) {
          font_family.fonts.push(font)
        } else {
          font_family = { fonts: [ font ] } as FontFamily
          state.library.set(font.family, font_family)
        }
      }
    },
    list: function (state) {
      state.families = [ ...state.library.keys() ]
    },
  },
  actions: <ActionTree<State, unknown>>{
    hydrate: async function (context) {
      context.commit('clear')

      const fonts = await window.queryLocalFonts()

      context.commit('load', fonts)
      context.commit('list')
    },
  },
}
