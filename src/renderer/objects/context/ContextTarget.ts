export enum ContextTargetType {
  Explorer,
  ExplorerNode,
  RenderedViewport,
  ComposeViewport,
}

export default interface ContextTarget {
  type: ContextTargetType
  path: string
}
