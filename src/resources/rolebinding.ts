import Resource from './resource.js'

interface ISubject {
 // Kind of object being referenced. Values defined by this API group are "User", "Group", and "ServiceAccount".
	// If the Authorizer does not recognized the kind value, the Authorizer should report an error.
	kind: string

	// APIGroup holds the API group of the referenced subject.
	// Defaults to "" for ServiceAccount subjects.
	// Defaults to "rbac.authorization.k8s.io" for User and Group subjects.
	// +optional
	apiGroup?: string

	// Name of the object being referenced.
	name: string

	// Namespace of the referenced object.  If the object kind is non-namespace, such as "User" or "Group", and this value is not empty
	// the Authorizer should report an error.
	// +optional
	namespace?: string
}

interface IRoleRef {
  // APIGroup is the group for the resource being referenced
	apiGroup: string

	// Kind is the type of resource being referenced
	kind: string

	// Name is the name of resource being referenced
	name: string
}

export class RoleBinding extends Resource {

  // Subjects holds references to the objects the role applies to.
	// +optional
	subjects?: ISubject[]

	// RoleRef can reference a Role in the current namespace or a ClusterRole in the global namespace.
	// If the RoleRef cannot be resolved, the Authorizer must return an error.
	roleRef: IRoleRef

  constructor(name: string) {
    super(name, 'rolebindings', 'RoleBinding', 'rbac.authorization.k8s.io', 'v1')
  }

  async isReady() {
    return true
  }

}
