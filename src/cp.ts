import { promisify } from 'util'
import { exec as e } from 'child_process'
import config from 'config'
import { ILoggingConfig } from './types.js'
import mlog from 'mocha-logger'

const cp = promisify(e)

export default async function exec(cmd): Promise<string> {
  if (config.get<ILoggingConfig>('logging')?.showCommands)
    mlog.log(cmd)

  if (config.has('dryRun') && config.get<Boolean>('dryRun')) {
    mlog.log(cmd)
    return 'ok'
  }
  return (await cp(cmd)).stdout
}

