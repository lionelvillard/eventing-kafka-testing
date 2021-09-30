import Resource from './resource.js'

export default class ConfigMap extends Resource {

  data: Record<string, string>

  constructor(name, data) {
    super(name, 'configmaps', 'ConfigMap', '', 'v1')

    this.data = data
  }

}
