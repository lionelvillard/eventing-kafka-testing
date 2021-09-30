import assert from 'assert'
import { Service } from './service.js'

describe('service resource', () => {

  it('should generate proper YAML', function () {
    let svc = new Service('aservice')
    svc.spec.selector = { 'key1': 'value1', 'key2' : 'value2' }
    let yaml = svc.asYAML()

    assert.deepEqual(yaml, `apiVersion: v1
kind: Service
metadata:
  name: aservice
spec:
  ports:
    - name: http
      port: 80
      protocol: TCP
      targetPort: 8080
  selector:
    key1: value1
    key2: value2
`)
  })
})
