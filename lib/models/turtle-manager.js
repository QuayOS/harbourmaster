/**
 * Turtle manager module.
 * @module
 */

'use strict'

const log = require('logbook').createLogger(__filename)

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
    if (typeof turtleId !== 'string') {
      throw new Error('turtleId must be a string')
    }
    if (turtleId in this.turtles) {
      return this.turtles[turtleId]
    }
    log.verbose('Creating a new turtle object', { turtleId })
    const turtle = new Turtle(turtleId)
    this.turtles[turtleId] = turtle
    return turtle
  }

  deleteTurtle (turtleId) {
    log.verbose('Deleting turtle object', { turtleId })
    delete this.turtles[turtleId]
  }

  /**
   * Checks whether a turtle with the given id exists.
   * @param  {string} turtleId The turtle id of to check.
   * @return {boolean} Whether the turtle is registered or not.
   */
  turtleExists (turtleId) {
    return turtleId in this.turtles
  }

  /**
   * Return the list of known turtles as array.
   * @return {module:models/turtle~Turtle[]} All known turtles
   */
  listTurtles () {
    return Object.keys(this.turtles).map(turtleId => this.turtles[turtleId])
  }
}

module.exports = {
  TurtleManager
}
