import { makeK8sName } from './naming.js'
import * as k from './kubectl.js'
import config from 'config'
import mlog from 'mocha-logger'

class Context {

  kubectl = {
    outer: this,
    apply: async function () { return k.apply(this.outer, ...arguments) },
    get: async function () { return k.get(this.outer, ...arguments) },
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
