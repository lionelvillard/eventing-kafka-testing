import Resource from './resource.js'
import config from 'config'

export default function make(name) {
  return new Topic(name)
}

class Topic extends Resource {

  constructor(name) {
    super(name, 'kafkatopics', 'KafkaTopic', 'kafka.strimzi.io', `v1beta1`)

    this.metadata.namespace = config.kafka.namespace
    this.metadata.labels = {
      'strimzi.io/cluster': 'my-cluster'
    }
    this.spec = {
      partitions: 1,
      replicas: 1
    }
  }

  clusterScoped() {
    return true // namespace is embedded in the YAML
  }


}

