import Resource from './resource.js'
import config from 'config'
import { IKafkaConfig } from '../types.js'

export default function make(name) {
  return new Topic(name)
}

interface ISpec {
  partitions: number,
  replicas: number
}

class Topic extends Resource {

  spec: ISpec

  constructor(name) {
    super(name, 'kafkatopics', 'KafkaTopic', 'kafka.strimzi.io', `v1beta1`)

    this.metadata.namespace = config.get<IKafkaConfig>('kafka').namespace
    this.metadata.labels = {
      'strimzi.io/cluster': 'my-cluster'
    }
    this.spec = {
      partitions: 1,
      replicas: 1
    }
  }

  bind(context) {
    this._context = context
    return this
  }

}

