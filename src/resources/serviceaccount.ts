import Resource from './resource.js'

export class ServiceAccount extends Resource {

  constructor(name: string) {
    super(name, 'serviceaccounts', 'ServiceAccount', '', 'v1')
  }

  async isReady() {
    return true
  }
}
