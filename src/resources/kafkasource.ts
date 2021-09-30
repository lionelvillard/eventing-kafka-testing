import Resource from './resource.js'
import type { IDestination } from './types.js'

interface ISpec {
  bootstrapServers: string[]
  topics: string[]
  sink: IDestination
}

export class KafkaSource extends Resource {
  spec: ISpec

  constructor(name, bootstrapServer, topic, sink) {
    super(name, 'kafkasources', 'KafkaSource', 'sources.knative.dev', 'v1beta1')

    this.spec = {
      bootstrapServers: [bootstrapServer],
      topics: [topic],
      sink: sink,
    }

  }

}
