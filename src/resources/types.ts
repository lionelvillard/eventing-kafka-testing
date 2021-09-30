export type LabelType = { [key: string]: string }
export type SelectorType = { [key: string]: string }

export interface IMetadata {
  name: string
  namespace: string
  labels: LabelType
}

export interface IDestination {
  ref: IReference
}

export interface IReference {
  apiVersion: string
  kind: string
  name: string
}

