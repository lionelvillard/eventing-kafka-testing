import makeKafkasource  from './kafkasource.js'
import makeKafkaTopic from './kafkatopic.js'
import makeRecordEvents from './recordevents.js'

export const kafkatopic = {
  make: makeKafkaTopic
}

export const kafkasource = {
  make: makeKafkasource
}

export const recordevents = {
  make: makeRecordEvents
}
