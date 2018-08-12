/**
 * Turtle manager module.
 * @module
 */

'use strict'

const log = require('../util/logger').createLogger(__filename)

const { Turtle } = require('./turtle')

/**
 * Provides an interface for storing and accessing {@link module:models/turtle~Turtle} objects.
 */
class TurtleManager {
  /**
   * Create a new TurtleManager instance.
   */
  constructor () {
    this.turtles = { }
  }

  /**
   * Get a turtle. If it does not exist, one with the given id is implicitly
   * created.
   * @param  {string} turtleId The id of the turtle to get.
   * @return {module:models/turtle~Turtle} The turtle with the given id.
   */
  getTurtle (turtleId) {
    if (turtleId in this.turtles) {
      return this.turtles[turtleId]
    }
    log.verbose('Creating a new turtle object', { turtleId: turtleId })
    const turtle = new Turtle(turtleId)
    this.turtles[turtleId] = turtle
    return turtle
  }
}

module.exports = {
  TurtleManager
}
