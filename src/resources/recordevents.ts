import { Pod, RestartPolicy } from './pod.js'
import { Service, Role, RoleBinding, ServiceAccount } from './index.js'
import Resource from './resource.js'
import { v4 as uuidv4 } from 'uuid'
import ResourceList from './resourcelist.js'
import { Context } from '../context.js'
import { StreamToJSON } from '../watcher.js'
import config from 'config'
import { ILoggingConfig } from '../types.js'
import mlog from 'mocha-logger'

const image = 'docker.io/villardl/recordevents:latest'

export type { IRecordEventsOptions }

// Record Events options
interface IRecordEventsOptions {
  receiver?: IReceiverOptions
  sender?: ISenderOptions
  logger?: ILoggerOptions
  recorder?: IRecorderOptions
}

interface IReceiverOptions {
  // enabled the receiver when set to true
  enabled: boolean

  // ReceiverName is used to identify this instance of the receiver.
  receiverName?: string // `envconfig:"POD_NAME" default:"receiver-default" required:"true"`

  // Reply is used to define if the observer should reply back
  reply?: boolean // `envconfig:"REPLY" default:"false" required:"false"`

  // The event type to use in the reply, if enabled
  replyEventType?: string // `envconfig:"REPLY_EVENT_TYPE" default:"" required:"false"`

  // The event source to use in the reply, if enabled
  replyEventSource?: string  // `envconfig:"REPLY_EVENT_SOURCE" default:"" required:"false"`

  // The event data to use in the reply, if enabled
  replyEventData?: string  // `envconfig:"REPLY_EVENT_DATA" default:"" required:"false"`

  // This string to append in the data field in the reply, if enabled.
  // This will threat the data as text/plain field
  replyAppendData?: string // `envconfig:"REPLY_APPEND_DATA" default:"" required:"false"`

  // If events should be dropped, specify the strategy here.
  skipStrategy?: string // `envconfig:"SKIP_ALGORITHM" default:"" required:"false"`

  // If events should be dropped according to Linear policy, this controls
  // how many events are dropped.
  skipCounter?: number // `envconfig:"SKIP_COUNTER" default:"0" required:"false"`
}


interface ISenderOptions {
  enabled: boolean

  senderName?: string // `envconfig:"POD_NAME" default:"sender-default" required:"true"`

  // Sink url for the message destination
  sink?: string // `envconfig:"SINK" required:"true"`

  // InputEvent json encoded
  inputEvent?: string // `envconfig:"INPUT_EVENT" required:"false"`

  // InputHeaders to send (this overrides any event provided input)
  inputHeaders?: [key: string]  // `envconfig:"INPUT_HEADERS" required:"false"`

  // InputBody to send (this overrides any event provided input)
  inputBody?: string //`envconfig:"INPUT_BODY" required:"false"`

  // The encoding of the cloud event: [binary, structured].
  eventEncoding?: string //`envconfig:"EVENT_ENCODING" default:"binary" required:"false"`

  // The number of seconds between messages.
  period?: number // `envconfig:"PERIOD" default:"5" required:"false"`

  // The number of seconds to wait before starting sending the first message
  delay?: number // `envconfig:"DELAY" default:"5" required:"false"`

  // The number of messages to attempt to send. 0 for unlimited.
  maxMessages?: number // `envconfig:"MAX_MESSAGES" default:"1" required:"false"`

  // Should tracing be added to events sent.
  addTracing?: boolean // `envconfig:"ADD_TRACING" default:"false" required:"false"`

  // Should add extension 'sequence' identifying the sequence number.
  addSequence?: boolean // `envconfig:"ADD_SEQUENCE" default:"false" required:"false"`

  // Override the event id with an incremental id.
  IncrementalId?: boolean // `envconfig:"INCREMENTAL_ID" default:"false" required:"false"`
}

interface ILoggerOptions {
  enabled: boolean
}

interface IRecorderOptions {
  enabled: boolean
}

// EventRecorder is a resource that can send or receive events.
export class EventRecorder extends ResourceList {

  pod: Pod
  service: Service

  serviceAccount: ServiceAccount
  role: Role
  roleBinding: RoleBinding

  events: Array<any>

  constructor(name: string, options?: IRecordEventsOptions) {
    super()

    this.pod = new Pod(name, image)
    this.pod.metadata.labels = { 'e2etest': uuidv4() }
    this.pod.spec.restartPolicy = RestartPolicy.Never

    this.service = new Service(name)
    this.service.spec.selector = this.pod.metadata.labels

    this._syncEnvVars(options)

    this.events = []
  }

  resources() {
    let core = [this.pod, this.service] as Resource[]
    if (this.serviceAccount) {
      core = [this.serviceAccount, this.role, this.roleBinding, ...core]
    }
    return core
  }

  asDestination() {
    return this.service.asDestination()
  }

  bind(context: Context) {
    super.bind(context)

    if (this.serviceAccount) {
      this.roleBinding.subjects[0].namespace = context.namespace
    }

    let converter = new StreamToJSON()
    converter.addListener('json', this.eventReceived.bind(this))
    context.watch('events', converter.dataReceived.bind(converter))
    return this
  }

  _syncEnvVars(options: IRecordEventsOptions) {
    // EVENT_GENERATORS
    let generators = ''
    let sep = ''
    if (options?.receiver?.enabled) {
      generators = 'receiver'
      sep = ','
    }

    if (options?.sender?.enabled) {
      generators += sep + 'sender'
    }

    this.pod.setEnvVarValue(0, 'EVENT_GENERATORS', generators)

    // EVENT_LOGS
    let logs = ''
    sep = ''
    if (options?.logger?.enabled) {
      logs = 'logger'
      sep = ','
    }

    if (options?.recorder?.enabled) {
      logs += sep + 'recorder'

      this.pod.setEnvVarValueFrom(0, 'POD_NAME', {
        fieldRef: {
          fieldPath: 'metadata.name'
        }
      })

      let name = this.pod.metadata.name
      this.pod.spec.serviceAccountName = name

      this.serviceAccount = new ServiceAccount(name)

      this.role = new Role(name)
      this.role.rules = [{
        apiGroups: [''],
        resources: ['pods'],
        verbs: ['get'],
      },
      {
        apiGroups: [''],
        resources: ['events'],
        verbs: ['*'],
      }]

      this.roleBinding = new RoleBinding(name)
      this.roleBinding.subjects = [{
        kind: 'ServiceAccount',
        name: name,
        namespace: this.pod.metadata.namespace,
      }]
      this.roleBinding.roleRef = {
        kind: 'Role',
        name: name,
        apiGroup: 'rbac.authorization.k8s.io',
      }
    }

    this.pod.setEnvVarValue(0, 'EVENT_LOGS', logs)
    this.pod.setEnvVarValueFrom(0, 'SYSTEM_NAMESPACE', {
      fieldRef: {
        fieldPath: 'metadata.namespace'
      }
    })
  }

  eventReceived(event: any) {
    if (event.reason === 'CloudEventObserved') {
      if (config.get<ILoggingConfig>('logging')?.showEvents)
        mlog.log(event)

      this.events.push(event)
    }
  }

  eventCount(): number {
    return this.events.length
  }

}
