'use strict'

const log = require('../util/logger').createLogger(__filename)

const { MQTTWrapper } = require('../util/mqtt-wrapper')
const { TurtleManager } = require('../models/turtle-manager')

class Client {
  constructor (options) {
    this.client = new MQTTWrapper()

    this.server = (options && options.server) || process.env.MQTT_SERVER || 'mqtt://test.mosquitto.org'
    this.baseTopic = (options && options.baseTopic) || process.env.MQTT_BASE_TOPIC || 'quayos/turtles'

    this.turtles = new TurtleManager()
  }

  async run () {
    log.info('Connecting to MQTT server')
    await this.client.connect(this.server)

    log.info('Registering topic handlers')
    await this.client.subscribe(`${this.baseTopic}/+/status`, this.statusHandler.bind(this))

    log.info('Sending test messages')
    for (let i = 0; i < 4; i++) {
      await this.client.publish(`${this.baseTopic}/${i}/status`, {
        online: true,
        fuel: 0,
        position: { x: 0, y: 0, z: 0 },
        orientation: 'north',
        whitelist: [],
        inventory: []
      })
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    log.info('Shutting down client')
    await this.client.disconnect()
  }

  async statusHandler (message, topic) {
    const turtleIdMatch = topic.match(/([^/]+)\/status$/)
    if (!turtleIdMatch) {
      log.error('Could extract turtleId from topic', { topic })
      return
    }
    const turtleId = turtleIdMatch[1]

    log.verbose('Received status update', { turtleId, message, topic })

    try {
      await (this.turtles.getTurtle(turtleId).updateStatus(message))
    } catch (err) {
      log.warn('Failed to update turtle status', { err: err.stack })
    }
  }
}

module.exports = {
  Client
}
