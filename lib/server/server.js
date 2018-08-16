/**
 * REST server module.
 * @module
 */

'use strict'

const Koa = require('koa')
const Router = require('koa-router')

const log = require('logbook').createLogger(__filename)

/**
 * @external "koa-router.Router"
 * @see {@link https://www.npmjs.com/package/koa-router#exp_module_koa-router--Router|koa-router.Router}
 */

/**
 * The Turtle Command Dispatcher's REST server. Provides a REST interface for
 * interacting with quayOS turtles through MQTT.
 */
class Server {
  /**
   * Create a new server instance.
   * @param {module:mqtt-client/client~Client} client The MQTT client to use for
   * receiving status updates and sending commands.
   * @param {module:models/turtle-manager~TurtleManager} turtleManager the
   * TurtleManager to use for querying turtle state.
   */
  constructor (client, turtleManager) {
    this.client = client
    this.turtleManager = turtleManager

    const router = this.buildRoutes()

    this.app = new Koa()
    this.app
      .use(router.routes())
      .use(router.allowedMethods())
  }

  /**
   * Creates a router for handling all server routes.
   * @private
   * @return {external:"koa-router.Router"} A router with all routes mounted.
   */
  buildRoutes () {
    const router = new Router()

    // Setup route patameters.
    router
      .param('turtleId', (turtleId, ctx, next) => {
        if (!this.turtleManager.turtleExists(turtleId)) {
          ctx.status = 404
          ctx.body = { error: 'Turtle does not exist', turtleId }
          return
        }
        ctx.turtle = this.turtleManager.getTurtle(turtleId)
        return next()
      })

    // Setup routes.
    router
      .get('/turtles', async ctx => {
        const includeOffline = ['true', '✓'].includes(ctx.request.query.include_offline)
        log.info('GET /turtles', { includeOffline })

        const turtles = this.turtleManager.listTurtles()
          .filter(turtle => includeOffline || turtle.online)
          .map(turtle => ({
            id: turtle.id,
            online: turtle.online,
            last_contact: turtle.lastUpdate,
            position: turtle.position
          }))

        ctx.body = { turtles }
      })
      .get('/turtles/:turtleId', async ctx => {
        log.info('GET /turtles/:turtleId', { turtleId: ctx.turtle.id })
        const turtle = {
          id: ctx.turtle.id,
          online: ctx.turtle.online,
          fuel: ctx.turtle.fuel,
          last_contact: ctx.turtle.lastUpdate,
          whitelist: ctx.turtle.whitelist,
          inventory: ctx.turtle.inventory
        }
        for (let optionalProperty of ['position', 'orientation']) {
          if (ctx.turtle[optionalProperty]) {
            turtle[optionalProperty] = ctx.turtle[optionalProperty]
          }
        }
        ctx.body = turtle
      })

    return router
  }

  /**
   * Start the server.
   * @param  {number} port The port to listen on
   * @return {Promise} [description]
   */
  listen (port) {
    log.info('Starting REST server', { port })
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, err => {
        if (err) {
          log.error('Error starting REST server', { err })
          return reject(err)
        }
        log.info('Started REST server', { port })
        resolve()
      })
    })
  }

  /**
   * Stop the server if running.
   */
  stop () {
    if (this.server) {
      log.info('Stopping REST server')
      this.server.close()
    }
  }
}

module.exports = {
  Server
}
