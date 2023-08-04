import fastify from 'fastify'
import * as amqp from 'amqplib'
import { randomUUID } from 'crypto'
import 'dotenv/config'

const server = fastify({ logger: true })

if (!process.env.RABBIT_MQ_URL) {
  server.log.error('RabbitMQ URL was not provided')
  process.exit(1)
}

if (!process.env.HTTP_SERVER_PORT) {
  server.log.error('Port for HTTP server was not provided')
  process.exit(1)
}

const connection = await amqp.connect(process.env.RABBIT_MQ_URL)
const channel = await connection.createChannel()

server.get('/time', async (req, res) => {
  const correlationId = randomUUID()
  const responseQueue = await channel.assertQueue('', { exclusive: true })

  req.log.info(`REQ rpc_time_queue ${correlationId}`)

  // Отправка запроса в очередь
  channel.sendToQueue('rpc_time_queue', Buffer.from(''), {
    correlationId,
    replyTo: responseQueue.queue
  })

  // Ожидание ответа от второго микросервиса
  const response = await new Promise((resolve) => {
    channel.consume(responseQueue.queue, (msg) => {
      if (msg?.properties.correlationId === correlationId) {
        resolve(msg.content.toString());
      }
    }, { noAck: true })
  })

  channel.deleteQueue(responseQueue.queue) // Удаляем временную очередь

  req.log.info(`RES rpc_time_queue ${correlationId}`)
  req.log.info(response)

  // Ответ клиенту с полученным временем
  res.send({ time: response })
})

server.listen({ port: Number(process.env.HTTP_SERVER_PORT) }, (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})

