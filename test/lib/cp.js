import util from 'util'
import { exec as e } from 'child_process'
import config from 'config'
import mlog from 'mocha-logger'

const cp = util.promisify(e)

export default async function exec(cmd) {
  if (config.get('logging')?.showCommands)
    mlog.log(cmd)

  if (config.has('dryRun') && config.get('dryRun')) {
    mlog.log(cmd)
    return { stdout: 'ok', stderr: '' }
  }
  return await cp(cmd)
}

