import * as amqp from 'amqplib'
import { pino } from 'pino'
import 'dotenv/config'

const logger = pino();

if (!process.env.RABBIT_MQ_URL) {
  logger.error('RabbitMQ URL was not provided')
  process.exit(1)
}

const connection = await amqp.connect(process.env.RABBIT_MQ_URL)
const channel = await connection.createChannel()
const queue = await channel.assertQueue('rpc_time_queue', { durable: false })

channel.prefetch(1)

logger.info('AWT rpc_time_queue')

channel.consume(queue.queue, (msg) => {
  const date = (new Date).toISOString()
  channel.sendToQueue(msg?.properties.replyTo, Buffer.from(date), { correlationId: msg?.properties.correlationId })
  logger.info(`ANS rpc_time_queue ${msg?.properties.correlationId}`)
  channel.ack(msg as amqp.ConsumeMessage)
})

