import Resource from './resource.js'

export enum RestartPolicy {
  Always = 'Always',
  OnFailure = 'OnFailure',
  Never = 'Never',
}

interface ISpec {
  containers: IContainer[]

  // List of volumes that can be mounted by containers belonging to the pod.
  // More info: https://kubernetes.io/docs/concepts/storage/volumes
  volumes?: IVolume[]

  // Restart policy for all containers within the pod.
  // One of Always, OnFailure, Never.
  // Default to Always.
  restartPolicy?: RestartPolicy

  // ServiceAccountName is the name of the ServiceAccount to use to run this pod.
	// More info: https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/
	// +optional
	serviceAccountName?: string
}

interface IVolume {
  // Volume's name.
  name: string

  // ConfigMap represents a configMap that should populate this volume
  configMap?: IConfigMapVolumeSource
}

interface IConfigMapVolumeSource {
  // Name of the referent.
  name: string
}

interface IContainer {
  name: string
  image: string
  command?: string[]
  args?: string[]
  env?: any

  volumeMounts?: IVolumeMount[]
}

interface IVolumeMount {
  // This must match the Name of a Volume.
  name: string

  // Path within the container at which the volume should be mounted.  Must
  // not contain ':'.
  mountPath: string
}

export class Pod extends Resource {

  spec: ISpec

  constructor(name, image) {
    super(name, 'pods', 'Pod', '', 'v1')

    this.spec = {
      containers: [{ name, image }]
    }
  }

  protected setEnvVar(containerIndex, name, value, from?: boolean) {
    let container = this.spec.containers[containerIndex]

    let envvars = container.env
    if (!envvars) {
      envvars = []
      container.env = envvars
    }

    // Exist already?
    for (let envvar of envvars) {
      if (envvar.name == name) {
        if (from) {
          envvar.valueFrom = value
        } else {
          envvar.value = value
        }
        return
      }
    }

    // Add
    if (from) {
      envvars.push({ name, valueFrom: value })
    } else {
      envvars.push({ name, value })
    }
  }


  setEnvVarValue(containerIndex, name, value) {
    this.setEnvVar(containerIndex, name, value, false)
  }

  setEnvVarValueFrom(containerIndex, name, value) {
    this.setEnvVar(containerIndex, name, value, true)
  }

}
