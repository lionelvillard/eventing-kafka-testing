import assert from 'assert'
import { Pod } from './pod.js'

describe('pod resource', () => {

  it('should generate proper YAML', function () {
    let pod = new Pod('apod', 'animage')
    pod.spec.containers[0].env = [
      { name: 'key1', value: 'value1' },
      { name: 'key2', 'value': 'value2' }
    ]
    pod.metadata.labels = {
      'label1': 'labelvalue1',
      'label2': 'labelvalue2'
    }
    let yaml = pod.asYAML()

    assert.deepEqual(yaml, `apiVersion: v1
kind: Pod
metadata:
  name: apod
  labels:
    label1: labelvalue1
    label2: labelvalue2
spec:
  containers:
    - name: apod
      image: animage
      env:
        - name: key1
          value: value1
        - name: key2
          value: value2
`)
  })

  it('should add environment var to first container', function () {
    let pod = new Pod('apod', 'animage')
    pod.setEnvVarValue(0, 'key1', 'value1')
    let yaml = pod.asYAML()

    assert.deepEqual(yaml, `apiVersion: v1
kind: Pod
metadata:
  name: apod
spec:
  containers:
    - name: apod
      image: animage
      env:
        - name: key1
          value: value1
`)
  })

  it('should set environment var value to first container', function () {
    let pod = new Pod('apod', 'animage')
    pod.setEnvVarValue(0, 'key1', 'value1')
    pod.setEnvVarValue(0, 'key1', 'value2')

    let yaml = pod.asYAML()

    assert.deepEqual(yaml, `apiVersion: v1
kind: Pod
metadata:
  name: apod
spec:
  containers:
    - name: apod
      image: animage
      env:
        - name: key1
          value: value2
`)
  })
})
