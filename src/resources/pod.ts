import Resource from './resource.js'

export function make(name, image) {
  return new Pod(name, image)
}

interface ISpec {
  containers: IContainer[]
}

interface IContainer {
  name: string
  image: string
  env?: any
}

export class Pod extends Resource {

  spec: ISpec

  constructor(name, image) {
    super(name, 'pods', 'Pod', '', 'v1')

    this.spec = {
      containers: [{ name, image }]
    }
  }

  setEnvVar(containerIndex, name, value) {
    let container = this.spec.containers[containerIndex]

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
    envvars.push({ name, value })
  }

}
