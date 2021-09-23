import retry from 'retry-assert'
import Resource from './resource.js'

type ResourceMap = {
  [key: string]: Resource
}

// A list of Kubernetes resources
export default class ResourceList {

  resources: ResourceMap

  constructor() {
    this.resources = {}
  }

  bind(context) {
    for (let [_, r] of Object.entries(this.resources)) {
      r.bind(context)
    }
    return this
  }

  asYAML() {
    let yaml = ''
    for (let [_, r] of Object.entries(this.resources)) {
      yaml += r.asYAML()
      yaml += `---\n`
    }
    return yaml
  }

  // Apply all resources to the bound context
  async apply() {
    for (let [_, r] of Object.entries(this.resources)) {
      await r.apply()
    }
  }

  // Returns true when all resources are ready
  async isReady() {
    for (let [_, r] of Object.entries(this.resources)) {
      if (!await r.isReady()) {
        return false
      }
    }

    return true
  }

  // Wait for the resource to be ready
  async waitForReadiness() {
    await retry().withTimeout(20000).withRetryDelay(1000).fn(() => this.isReady()).untilTruthy()
  }


}
