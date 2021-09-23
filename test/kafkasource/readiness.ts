import { kafkasource, kafkatopic, recordevents } from '../../src/resources/index.js'
import { naming, context as ctx, IKafkaConfig } from '../../src/index.js'
import config from 'config'

describe('KafkaSource readiness', () => {
  let context

  before(async () => context = await ctx.make('kafkasource'))
  after(async () => await context.tearDown())

  it('kafkasource should become ready', async () => {
    let name = naming.makeK8sName('ks')
    let topicName = naming.makeK8sName('topic')
    let sinkName = naming.makeK8sName('recorder')

    let recorder = recordevents.make(sinkName, { receiver: { enabled: true } })
    await recorder.bind(context).apply()
    await recorder.waitForReadiness()

    let topic = kafkatopic.make(topicName)
    await topic.bind(context).apply()
    await topic.waitForReadiness()

    let source = kafkasource.make(name, config.get<IKafkaConfig>('kafka').bootstrapServer, topicName, recorder.asDestination())
    await source.bind(context).apply()
    await source.waitForReadiness()
  })

})

