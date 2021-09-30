import Resource from './resource.js'

interface IPolicyRule {
  // Verbs is a list of Verbs that apply to ALL the ResourceKinds and AttributeRestrictions contained in this rule.  VerbAll represents all kinds.
  verbs: string[]

  // APIGroups is the name of the APIGroup that contains the resources.  If multiple API groups are specified, any action requested against one of
  // the enumerated resources in any API group will be allowed.
  // +optional
  apiGroups?: string[]

  // Resources is a list of resources this rule applies to.  ResourceAll represents all resources.
  // +optional
  resources?: string[]

  // ResourceNames is an optional white list of names that the rule applies to.  An empty set means that everything is allowed.
  // +optional
  resourceNames?: string[]
}

export class Role extends Resource {

  rules: IPolicyRule[]

  constructor(name: string) {
    super(name, 'roles', 'Role', 'rbac.authorization.k8s.io', 'v1')
  }

  async isReady() {
    return true
  }

}
