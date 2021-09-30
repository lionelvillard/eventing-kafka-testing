import assert from 'assert'
import { RoleBinding } from './rolebinding.js'

describe('role binding resource', () => {

  it('should generate proper YAML', function () {
    let rolebinding = new RoleBinding('arolebinding')

    rolebinding.roleRef = {
      apiGroup: 'v1',
      kind: 'Service',
      name: 'aname'
    }
    rolebinding.subjects = [ {kind: 'Service', name: 'aservice' }]

    let yaml = rolebinding.asYAML()

    assert.deepEqual(yaml, `apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: arolebinding
roleRef:
  apiGroup: v1
  kind: Service
  name: aname
subjects:
  - kind: Service
    name: aservice
`)
  })

})
