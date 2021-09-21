import Resource from './resource.js'

export function make(name, image) {
  return new Pod(name, image)
}

export class Pod extends Resource {

  constructor(name, image) {
    super(name, 'pods', 'Pod', '', 'v1')

    this.spec = {
      containers: [{ name, image }]
    }
  }

  setEnvVar(containerIndex, name, value) {
    let container = this.spec.containers[containerIndex]
    if (!container) {
      container = []
      this.spec.containers = container
    }

    let envvars = container.env
    if (!envvars) {
      envvars = []
      container.env = envvars
    }

    // Exist already?
    for (let envvar of envvars) {
      if (envvar.name == name) {
        envvar.value = value
        return
      }
    }

    // Add
    envvars.push({name, value})
  }

}
