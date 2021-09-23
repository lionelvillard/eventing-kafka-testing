import Resource from './resource.js'

export default function make(name, bootstrapServer, topic, sink) {
  return new KafkaSource(name, bootstrapServer, topic, sink)
}

class KafkaSource extends Resource {

  constructor(name, bootstrapServer, topic, sink) {
    super(name, 'kafkasources', 'KafkaSource', 'sources.knative.dev', 'v1beta1')

    this.spec = {
      bootstrapServers: [ bootstrapServer ],
      topics: [ topic ],
      sink: sink,
    }

  }

}
