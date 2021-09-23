import exec from './cp.js'
import tmp from 'tmp-promise'
import fs from 'fs/promises'

export async function createNamespace(name) {
  const { stdout, stderr } = await exec(`kubectl create namespace ${name}`)
  if (stderr) {
    throw stderr
  }
  return stdout
}

export async function deleteNamespace(name) {
  const { stdout, stderr } = await exec(`kubectl delete namespace ${name} --wait=false`)
  if (stderr) {
    throw stderr
  }
  return stdout
}

// --- basic CRUD

export async function apply(context, yaml, clusterScope) {
  let filename = await tmp.tmpName({ postfix: '.yaml' })
  await fs.writeFile(filename, yaml, 'utf-8', 'w')

  const { stdout, stderr } = await exec(`kubectl apply -f ${filename}${namespace(context, clusterScope)}`)
  if (stderr) {
    throw stderr
  }

  return stdout
}

export async function get(context, args, clusterScope) {
  const { stdout, stderr } = await exec(`kubectl ${namespace(context, clusterScope)} get ${args}`)
  if (stderr) {
    throw stderr
  }
  return stdout
}

// --- binding

function namespace(context, clusterScope) {
  if (clusterScope) {
    return ''
  }
  return context.namespace && context.namespace.length > 0 ? ` --namespace ${context.namespace}` : ''
}
