import Resource from './resource.js'
import type { IDestination } from './resource.js'

export default function make(name, bootstrapServer, topic, sink) {
  return new KafkaSource(name, bootstrapServer, topic, sink)
}

interface ISpec {
  bootstrapServers: string[]
  topics: string[]
  sink: IDestination
}

class KafkaSource extends Resource {
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
