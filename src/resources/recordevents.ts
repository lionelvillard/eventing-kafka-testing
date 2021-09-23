import { make as makePod, Pod } from './pod.js'
import { make as makeService, Service } from './service.js'
import { v4 as uuidv4 } from 'uuid'
import ResourceList from './resourcelist.js'

const image = 'docker.io/villardl/recordevents:latest'

export type { IOptions }

// Record Events options
interface IOptions {
  receiver?: IReceiverOptions
  sender?: ISenderOptions
  logger?: ILoggerOptions
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

export default function make(name: string, options?: IOptions) {
  return new EventRecorder(name, options)
}

// EventRecorder is a resource that can send or receive events.
export class EventRecorder extends ResourceList {

  constructor(name, options) {
    super()

    this.resources.pod = makePod(name, image)
    this.pod().metadata.labels = { 'e2etest': uuidv4() }

    this.resources.service = makeService(name)
    this.svc().spec.selector = this.resources.pod.metadata.labels

    this._syncEnvVars(options)
  }

  asDestination() {
    return this.resources.service.asDestination()
  }

  pod(): Pod {
    return this.resources.pod as Pod
  }

  svc(): Service {
    return this.resources.service as Service
  }

  _syncEnvVars(options: IOptions) {
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

    this.pod().setEnvVar(0, 'EVENT_GENERATORS', generators)

    // EVENT_LOGS
    let logs = ''
    if (options?.logger?.enabled) {
      logs = 'logger'
    }

    this.pod().setEnvVar(0, 'EVENT_LOGS', logs)
  }

}
