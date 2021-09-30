import Resource from './resource.js'
import config from 'config'
import { IKafkaConfig } from '../types.js'

interface ISpec {
  partitions: number,
  replicas: number
}

export class KafkaTopic extends Resource {

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

