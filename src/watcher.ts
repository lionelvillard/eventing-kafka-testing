
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { Context } from './context'
import EventEmitter from 'events'
import mlog from 'mocha-logger'

export class Watcher extends EventEmitter {

  process: ChildProcessWithoutNullStreams

  constructor(public _context: Context) {
    super()

    this.process = spawn(`kubectl get -n ${this._context.namespace} events.events.k8s.io --watch -ojson`, { shell: true })

    this.process.stdout.on('data', data => {
      this.emit('data', data.toString())
    })

    this.process.stderr.on('data', data => {
      this.emit('error', data.toString())
    })

    this.process.on('error', data => {
      console.log(data)
    })
  }

  stop() {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
  }

}

export class StreamToJSON extends EventEmitter {

  s = ''

  constructor() {
    super()
  }

  dataReceived(data: string) {
    if (!data)
      return

    let lines = data.split('\n')

    for (let line of lines) {
      this.s += line
      if (line[0] == '}') {
        try {
          let parsed = JSON.parse(this.s)
          this.emit('json', parsed)
          this.s = ''
        } catch (e) {
          mlog.error(`failed to parse stream to JSON: ${this.s}`)
          mlog.error(e)
          this.s = ''
        }
      }
    }
  }
}
