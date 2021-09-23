import { make as makePod } from './pod.js'
import { make as makeService } from './service.js'
import { v4 as uuidv4 } from 'uuid'
import ResourceList from './resourcelist.js'

const image = 'docker.io/villardl/recordevents:latest'

export default function make(name) {
  return new EventRecorder(name)
}

// EventRecorder is a resource that can send or receive events.
class EventRecorder extends ResourceList {

  constructor(name) {
    super()

    this.resources.pod = makePod(name, image)
    this.resources.pod.metadata.labels = { 'e2etest': uuidv4() }

    this.resources.service = makeService(name)
    this.resources.service.spec.selector = this.resources.pod.metadata.labels

    this.hasReceiver = false
    this.hasSender = false

    this.hasLogger = false

    this._syncEnvVars()
  }

  // withReceiver enables receiving events
  withReceiver() {
    this.hasReceiver = true
    this._syncEnvVars()
    return this
  }

  // withReceiver enables sending events
  withSender() {
    this.hasSender = true
    this._syncEnvVars()
    return this
  }

  // withLogger enables printing received events to the console
  withLogger() {
    this.hasLogger = true
    this._syncEnvVars()
    return this
  }

  asDestination() {
    return this.resources.service.asDestination()
  }

  _syncEnvVars() {
    // EVENT_GENERATORS
    let generators = ''
    let sep = ''
    if (this.hasReceiver) {
      generators = 'receiver'
      sep = ','
    }
    if (this.hasSender) {
      generators += sep + 'sender'
    }

    this.resources.pod.setEnvVar(0, 'EVENT_GENERATORS', generators)

    // EVENT_LOGS
    let logs = ''
    if (this.hasLogger) {
      logs = 'logger'
    }

    this.resources.pod.setEnvVar(0, 'EVENT_LOGS', logs)
  }

}
