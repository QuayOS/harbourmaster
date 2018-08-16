'use strict'

const log = require('logbook').createLogger(__filename)

const { Server } = require('./lib/server/server')
const { TurtleManager } = require('./lib/models/turtle-manager')
const { Client } = require('./lib/mqtt-client/client')

const turtleManager = new TurtleManager()
const client = new Client(turtleManager, {
  server: process.env.MQTT_SERVER,
  baseTopic: process.env.MQTT_BASE_TOPIC
})
const server = new Server(client, turtleManager)

for (let signal of ['SIGINT', 'SIGQUIT', 'SIGTERM']) {
  process.on(signal, () => {
    log.info(`Received ${signal}, shutting down`)
    client.stop()
    server.stop()
  })
}

Promise.all([
  client.run(),
  server.listen(3000)
])
