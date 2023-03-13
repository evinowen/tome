import Vue from 'vue'

export class CommitProperties extends Vue {}

export default class Commit extends CommitProperties {
  $refs: {
    list: HTMLElement
  }

  offset: number

  get system(): any
  get repository(): any
  get staging(): boolean
  get staged(): any[]
  get available(): any[]
  get configuration(): any
  get working(): boolean

  resize()
  sign_name(value): Promise<void>
  sign_email(value): Promise<void>
  sign_message(value): Promise<void>
  close(): Promise<void>
  confirm(value): Promise<void>
  push(value): Promise<void>
  message(message): Promise<void>
  diff(file): Promise<void>
  stage(path) : Promise<void>
  reset(path): Promise<void>
  commit(): Promise<void>
}