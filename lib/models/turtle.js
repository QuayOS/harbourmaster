/**
 * Turtle module.
 * @module
 */

'use strict'

const { validator } = require('../schemas/schema-validator')

const log = require('../util/logger').createLogger(__filename)

/**
 * @typedef Position
 * @type {object}
 * @property {number} x X distance relative to world origin.
 * @property {number} y Y distance relative to world origin.
 * @property {number} z Z distance relative to world origin.
 */

/**
 * @typedef Orientation
 * @type {("north"|"east"|"south"|"west")}
 */

/**
 * @typedef InventorySlot
 * @type {object}
 * @property {string} name The name of the item in the inventory slot.
 * @property {number} damage The damage value of the item in the inventory slot.
 * @property {number} count The number of items in the stack in the inventory slot.
 */

/**
 * Stores the server side state of an ingame turtle.
 */
class Turtle {
  /**
   * Create a turtle.
   * @param {string} id The unique id of the turtle.
   */
  constructor (id) {
    /**
     * The turtle's unique ID.
     * @type {string}
     */
    this.id = id

    /**
     * If the turtle is online or offline.
     * @type {boolean}
     */
    this.online = false

    /**
     * The turtle's fuel level.
     * @type {number}
     */
    this.fuel = 0

    /**
     * The turtle's position.
     * @type {module:models/turtle~Position}
     */
    this.position = null

    /**
     * The turtle's orientation.
     * @type {module:models/turtle~Orientation}
     */
    this.orientation = null

    /**
     * The turtle's whitelist of mineable blocks.
     * @type {Array<string>}
     */
    this.whitelist = []

    /**
     * The turtle's inventory.
     * @type {Array<module:models/turtle~InventorySlot>}
     */
    this.inventory = []

    /**
     * Time when the turtle's state was last updated.
     * @type {Date}
     */
    this.lastUpdate = new Date(0)

    /**
     * Whether the instance received at least one status update.
     * @type {boolean}
     */
    this.initialised = false
  }

  /**
   * Update the status of the turtle.
   * @param  {object} status The status to set.
   * @param  {boolean} status.online Whether the turtle is online or not.
   * @param  {number} status.fuel The amount of fuel the turtle has left.
   * @param  {module:models/turtle~Position} status.position The position of the turtle.
   * @param  {module:models/turtle~Orientation} status.orientation The orientation of the turtle.
   * @param  {string[]} status.whitelist The mining whitelist of the turtle.
   * @param  {module:models/turtle~InventorySlot[]} status.inventory The inventory of the turtle.
   * @return {Promise} Resolves when the status was successfully updated.
   */
  async updateStatus (status) {
    log.debug('Received turtle status update', { turtleId: this.id, status })

    const validationResult = validator.validate(status, '/TurtleStatus')

    if (!validationResult.valid) {
      log.warn('Invalid status payload', { errors: validationResult.errors })
      const error = new Error('Invalid status payload')
      error.validationErrors = validationResult.errors
      throw error
    }

    // Copy all the values from the status into the turtle instance, since they are all valid
    Object.assign(this, status)
    this.initialised = true
    if (this.online) {
      this.lastUpdate = new Date()
    }
    log.debug('Updated turtle status', { turtle: this })
  }
}

module.exports = {
  Turtle
}
