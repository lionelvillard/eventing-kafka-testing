import assert from 'assert'
import { KCat } from './kcat.js'


describe('kafkacat resource', () => {

  it('should generate proper YAML, no options', function () {
    let kcat = new KCat('akafkacat', { bootstrapServer: 'bootstrap:9093', topic: 'atopic', payload: 'hello' })
    let yaml = kcat.asYAML()

    assert.deepEqual(yaml, `apiVersion: v1
kind: Pod
metadata:
  name: akafkacat
spec:
  containers:
    - name: akafkacat
      image: docker.io/confluentinc/cp-kafkacat
      command:
        - kafkacat
      volumeMounts:
        - name: event-payload
          mountPath: /etc/mounted
      args:
        - '-P'
        - '-T'
        - '-b'
        - bootstrap:9093
        - '-t'
        - atopic
        - '-l'
        - /etc/mounted/payload
  restartPolicy: Never
  volumes:
    - name: event-payload
      configMap:
        name: akafkacat
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: akafkacat
data:
  payload: hello
---
`)
  })

})
