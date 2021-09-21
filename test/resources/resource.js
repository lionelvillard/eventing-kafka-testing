import retry from 'retry-assert'
import mlog from 'mocha-logger'
import { dump } from 'js-yaml'

// A Kubernetes resource.
export default class Resource {

  constructor(name, resource, kind, group, version) {
    this._resource = resource
    this.apiVersion = `${group}${group.length > 0 ? '/' : ''}${version}`
    this.kind = kind
    this._group = group
    this._version = version
    this.metadata = { name }
  }

  bind(context) {
    this._context = context
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

  clusterScoped() {
    return false
  }

  // Apply this resource to the given context
  async apply() {
    await this._context.kubectl.apply(this.asYAML(), this.clusterScoped())
  }

  // Returns true when the resource is ready
  async isReady() {
    this.checkBound()

    mlog.pending(`checking ${this.metadata.name} readiness`)
    let status = await this._context.kubectl.get(`${this._resource}${this._group.length > 0 ? '.' : ''}${this._group} ${this.metadata.name}  -ojsonpath='{.status.conditions[?(@.type == "Ready")].status}'`, this.clusterScoped())
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

}
