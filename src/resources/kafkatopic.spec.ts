import assert from 'assert'
import { KafkaTopic } from './kafkatopic.js'

describe('Kafka topic resource', () => {

  it('should generate proper YAML', function () {
    let svc = new KafkaTopic('atopic')
    let yaml = svc.asYAML()

    assert.deepEqual(yaml, `apiVersion: kafka.strimzi.io/v1beta1
kind: KafkaTopic
metadata:
  name: atopic
  namespace: kafka
  labels:
    strimzi.io/cluster: my-cluster
spec:
  partitions: 1
  replicas: 1
`)
  })
})
