import { exec } from './cp.js'
import tmp from 'tmp-promise'
import fs from 'fs/promises'
import { Context } from './context.js'


export async function createNamespace(name: string): Promise<string> {
  return await exec(`kubectl create namespace ${name}`)
}

export async function deleteNamespace(name: string): Promise<string> {
  return await exec(`kubectl delete namespace ${name} --wait=false`)
}

// --- basic CRUD

export async function apply(context: Context, yaml: string ): Promise<string> {
  let filename = await tmp.tmpName({ postfix: '.yaml' })
  await fs.writeFile(filename, yaml, { encoding: 'utf-8', flag: 'w' })

  return await exec(`kubectl apply -f ${filename}`)
}

export async function get(context: Context, args: string) {
  return await exec(`kubectl get ${args}`)
}
