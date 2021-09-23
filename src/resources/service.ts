import Resource from './resource.js'
import mlog from 'mocha-logger'
import { SelectorType } from './resource.js'

export function make(name: string): Service {
  return new Service(name)
}

interface ISpec {
  ports: any
  selector: SelectorType
}

export class Service extends Resource {

  spec: ISpec

  constructor(name) {
    super(name, 'services', 'Service', '', 'v1')

    this.spec = {
      ports: [
        {
          name: 'http',
          port: 80,
          protocol: 'TCP',
          targetPort: 8080,
        }
      ],
      selector: {}
    }
  }

  async isReady() {
    this.checkBound()

    // A service is ready when its endpoint is ready (TODO: maybe not for all types of services?)
    mlog.pending(`checking ${this.metadata.name} readiness`)
    let ip = await this._context.kubectl.get(`endpoints ${this.ns()} ${this.metadata.name} -ojsonpath='{.subsets[0].addresses[0].ip}'`)
    return ip.length > 0
  }



}
