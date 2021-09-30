import retry from 'retry-assert'
import mlog from 'mocha-logger'
import { dump } from 'js-yaml'
import { Context } from '../context.js'
import type { IMetadata } from './types.js'


// A Kubernetes resource.
export default class Resource {

  apiVersion: string
  kind: string
  metadata: IMetadata
  _context: Context

  constructor(name: string, public _resource: string,
    kind: string, public _group: string, public _version: string) {

    this.apiVersion = `${_group}${_group.length > 0 ? '/' : ''}${_version}`
    this.kind = kind
    this.metadata = { name } as IMetadata
  }

  bind(context) {
    this._context = context
    this.metadata.namespace = context.namespace
    return this
  }

  asYAML() {
    return dump(this, { replacer: (key, value) => key.startsWith('_') ? undefined : value })
  }

  asDestination() {
    return {
      ref: {
        apiVersion: this.apiVersion,
        kind: this.kind,
        name: this.metadata.name,
      }
    }
  }

  // Apply this resource to the given context
  async apply() {
    await this._context.kubectl.apply(this.asYAML())
  }

  // Returns true when the resource is ready
  async isReady() {
    this.checkBound()

    mlog.pending(`checking ${this.metadata.name} readiness`)
    let status = await this._context.kubectl.get(`${this.ns()} ${this._resource}${this._group.length > 0 ? '.' : ''}${this._group} ${this.metadata.name}  -ojsonpath='{.status.conditions[?(@.type == "Ready")].status}'`)
    return status == 'True'
  }

  // Wait for the resource to be ready
  async waitForReadiness() {
    this.checkBound()

    await retry().withTimeout(20000).withRetryDelay(1000).fn(() => this.isReady()).untilTruthy()
  }

  checkBound() {
    if (!this._context) {
      throw new Error(`resource ${this.metadata.name}.${this._group} was not bound to a k8s context.`)
    }
  }

  protected ns(): string {
    return `-n ${this.metadata.namespace}`
  }
}
