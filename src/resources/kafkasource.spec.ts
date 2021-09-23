import assert from 'assert'
import makeKafkaSource from './kafkasource.js'

describe('Kafka source resource', () => {

  it('should generate proper YAML', function () {
    let destination = {
      ref: {
        apiVersion: 'v1',
        kind: 'Service',
        name: 'dest',
      }
    }
    let svc = makeKafkaSource('asource', 'bootstrap:9092', 'atopic', destination)
    let yaml = svc.asYAML()

    assert.deepEqual(yaml, `apiVersion: sources.knative.dev/v1beta1
kind: KafkaSource
metadata:
  name: asource
spec:
  bootstrapServers:
    - bootstrap:9092
  topics:
    - atopic
  sink:
    ref:
      apiVersion: v1
      kind: Service
      name: dest
`)
  })
})
