import assert from 'assert'
import { Role } from './role.js'

describe('role resource', () => {

  it('should generate proper YAML', function () {
    let role = new Role('arole')
    let yaml = role.asYAML()

    assert.deepEqual(yaml, `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: arole
`)
  })

  it('should generate proper YAML with rules', function () {
    let role = new Role('arole')
    role.rules = [
      {
        apiGroups: [ 'v1' ],
        verbs: [ 'watch', 'delete' ]
      } ]
    let yaml = role.asYAML()

    assert.deepEqual(yaml, `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: arole
rules:
  - apiGroups:
      - v1
    verbs:
      - watch
      - delete
`)
  })
})
