import Vue from 'vue'

export class AppProperties extends Vue {}

export default class App extends AppProperties {
  get repository(): any
  get system(): any
}
