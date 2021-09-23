import { makeK8sName } from './naming.js'
import * as k from './kubectl.js'
import config from 'config'
import mlog from 'mocha-logger'

export class Context {
  namespace: string

  kubectl = {
    outer: this,
    apply: async function (yaml) { return k.apply(this.outer, yaml) },
    get: async function (args) { return k.get(this.outer, args) },
  }

  constructor(namespace) {
    this.namespace = namespace
  }

  tearDown() {
    if (!config.has('noTearDown') || !config.get('noTearDown'))
      k.deleteNamespace(this.namespace)
  }

}

export async function make(name) {
  let namespace = makeK8sName(name)
  await k.createNamespace(namespace)
  mlog.success(`namespace ${namespace} created`)
  return new Context(namespace)
}
