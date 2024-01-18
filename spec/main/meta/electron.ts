import { IpcMainInvokeEvent } from 'electron'
export { IpcMainInvokeEvent } from 'electron'

// eslint-disable-next-line unicorn/prevent-abbreviations, @typescript-eslint/no-explicit-any
export type IpcListener = (event: IpcMainInvokeEvent, ...args: any[]) => any

export const ipcMainListenerMap = new Map<string, IpcListener>()

export const ipcRendererListenerMap = new Map<string, IpcListener>()

export const ipc_reset = () => {
  ipcMainListenerMap.clear()
  ipcMainListenerMap.clear()
}
