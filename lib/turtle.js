/**
 * Turtle module.
 * @module
 */

'use strict'

const { validator } = require('./schemas/schema-validator')

const log = require('./logger').createLogger(__filename)

/**
 * Stores the server side state of an ingame turtle.
 */
class Turtle {
  /**
   * Create a turtle.
   * @param {string} id The unique id of the turtle.
   */
  constructor (id) {
    this.id = id
    this.fuel = 0
    this.position = null
    this.orientation = null
    this.whitelist = []
    this.inventory = []

    this.initialised = false
  }

  /**
   * Update the status of the turtle.
   * @param  {object} status The status to set.
   * @param  {number} status.fuel The amount of fuel the turtle has left.
   * @param  {object} status.position The position of the turtle.
   * @param  {number} status.position.x The x position of the turtle.
   * @param  {number} status.position.y The y position of the turtle.
   * @param  {number} status.position.z The z position of the turtle.
   * @param  {string} status.orientation The orientation of the turtle. Either 'north', 'east', 'south' or 'west'.
   * @param  {string[]} status.whitelist The mining whitelist of the turtle.
   * @param  {object[]} status.inventory The inventory of the turtle.
   * @param  {string} status.inventory[].name The name of the item in the inventory slot.
   * @param  {number} status.inventory[].damage The damage value of the item in the inventory slot.
   * @param  {number} status.inventory[].count The number of items in the stack in the inventory slot.
   * @return {void} Resolves when the status was successfully updated.
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
    log.debug('Updated turtle status', { turtle: this })
  }
}

module.exports = {
  Turtle
}
