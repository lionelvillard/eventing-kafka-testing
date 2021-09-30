import { makeK8sName } from './naming.js'
import * as k from './kubectl.js'
import config from 'config'
import mlog from 'mocha-logger'
import { Watcher } from './watcher.js'

export class Context {
  namespace: string

  // Active watches
  watches: Record<string, Watcher>

  kubectl = {
    outer: this,
    apply: async function (yaml) { return k.apply(this.outer, yaml) },
    get: async function (args) { return k.get(this.outer, args) },
  }

  constructor(namespace) {
    this.namespace = namespace
    this.watches = {}
  }

  tearDown() {
    Object.keys(this.watches).forEach(key => this.watches[key].stop())

    if (!config.has('noTearDown') || !config.get('noTearDown'))
      k.deleteNamespace(this.namespace)
  }

  watch(resource: string, listener) {
    if (!this.watches[resource])
      this.watches[resource] = new Watcher(this)

    this.watches[resource].addListener('data', listener)
  }

}

export async function make(name) {
  let namespace = makeK8sName(name)
  await k.createNamespace(namespace)
  mlog.success(`namespace ${namespace} created`)
  return new Context(namespace)
}
