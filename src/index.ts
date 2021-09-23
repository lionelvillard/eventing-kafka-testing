import * as n from './naming.js'
import * as c from './context.js'

export { IKafkaConfig } from './types.js'

export const context = {
  make: c.make
}

export const naming = {
  makeK8sName: n.makeK8sName
}
