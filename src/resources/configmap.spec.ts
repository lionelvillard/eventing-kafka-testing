import assert from 'assert'
import ConfigMap from './configmap.js'

describe('configmap resource', () => {

  it('should generate proper YAML', function () {
    let pod = new ConfigMap('aconfigmap', { 'data1': 'value1', 'data2': 'value2', 'data3': '4'})
    let yaml = pod.asYAML()

    assert.deepEqual(yaml, `apiVersion: v1
kind: ConfigMap
metadata:
  name: aconfigmap
data:
  data1: value1
  data2: value2
  data3: '4'
`)
  })

})
