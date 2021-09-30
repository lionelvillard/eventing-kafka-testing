import assert from 'assert'
import { ServiceAccount } from './serviceaccount.js'

describe('service account resource', () => {

  it('should generate proper YAML', function () {
    let svc = new ServiceAccount('aserviceaccount')
    let yaml = svc.asYAML()

    assert.deepEqual(yaml, `apiVersion: v1
kind: ServiceAccount
metadata:
  name: aserviceaccount
`)
  })
})
