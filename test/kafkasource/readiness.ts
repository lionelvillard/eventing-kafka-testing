import {  EventRecorder, KafkaTopic, KCat, KafkaSource } from '../../src/resources/index.js'
import { naming, context as ctx, IKafkaConfig } from '../../src/index.js'
import config from 'config'
import { Context } from '../../src/context.js'
import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { poll } from '../../src/polling.js'
import mlog from 'mocha-logger'

use(chaiAsPromised)

describe('KafkaSource readiness', () => {
  let context: Context

  before(async () => context = await ctx.make('kafkasource'))
  after(async () => await context.tearDown())

  it('kafkasource should become ready', async () => {
    let bs = config.get<IKafkaConfig>('kafka').bootstrapServer
    let name = naming.makeK8sName('ks')
    let topicName = naming.makeK8sName('topic')
    let sinkName = naming.makeK8sName('recorder')

    let recorder = new EventRecorder(sinkName, { receiver: { enabled: true }, logger: { enabled: true }, recorder: { enabled: true } })
    await recorder.bind(context).apply()
    await recorder.waitForReadiness()

    let topic = new KafkaTopic(topicName)
    await topic.bind(context).apply()
    await topic.waitForReadiness()

    let source = new KafkaSource(name, bs, topicName, recorder.asDestination())
    await source.bind(context).apply()
    await source.waitForReadiness()

    let sender = new KCat(name, { bootstrapServer: bs, topic: topicName, payload: '{"msg": "hello"}' })
    await sender.bind(context).apply()

    let cond = poll(() => {
      mlog.pending(`number of received events: ${recorder.eventCount()}`)
      return recorder.eventCount() == 1
    })

    await expect(cond).to.eventually.be.true
  })

})

