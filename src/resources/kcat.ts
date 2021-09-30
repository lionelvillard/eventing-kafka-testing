import {  Pod, RestartPolicy } from './pod.js'
import ConfigMap from './configmap.js'
import ResourceList from './resourcelist.js'
import resource from './resource.js'

const image = 'docker.io/confluentinc/cp-kafkacat'

interface IOptions {
  // Bootstrap broker(s) (host[:port])
  bootstrapServer: string

  // Topic to consume from, produce to, or list
  topic: string

  // Delimiter to split input key and message
  key?: string

  // -H <header=value>  Add Message Headers (may be specified multiple times)
  headers?: Record<string, string>[]

  payload: string
}

// KCat is a resource that can send events to Kafka
export class KCat extends ResourceList {

  pod: Pod
  payload: ConfigMap

  constructor(name: string, options: IOptions) {
    super()

    // Configure ConfigMap
    this.payload = new ConfigMap(name, { payload: options.payload })

    // Configure Pod
    this.pod = new Pod(name, image)
    this.pod.spec.restartPolicy = RestartPolicy.Never
    this.pod.spec.volumes = [{ name: 'event-payload', configMap: { name } }]

    let container = this.pod.spec.containers[0]
    container.command = ['kafkacat']
    container.volumeMounts = [{ name: 'event-payload', mountPath: '/etc/mounted' }]

    container.args = ['-P',
      '-T',
      '-b', options.bootstrapServer,
      '-t', options.topic,
      '-l',
      '/etc/mounted/payload',
      ...(options.key ? ['K', options.key] : []),
    ]

    options.headers?.forEach((k, v) => {
      container.args.push('-H')
      container.args.push(`${k}=${v}`)
    })
  }

  resources(): resource[] {
    return [this.pod, this.payload]
  }

}
