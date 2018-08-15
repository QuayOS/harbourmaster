/**
 * Utility module for creating a globally usable validator for all JSON schemas
 * in this directory.
 * @module
 */

'use strict'

const fs = require('fs')
const path = require('path')

const { Validator } = require('jsonschema')

const log = require('logbook').createLogger(__filename)

/**
 * @external "jsonschema.Validator"
 * @see {@link https://github.com/tdegrunt/jsonschema/blob/ce0d4f093236639aa7a56536c10253674db7494d/lib/validator.js|jsonschema.Validator}
 */

/**
 * Create a validator based on the JSON schemas in the schema directory.
 * @return {external:"jsonschema.Validator"} A Validator instance pre-fed with
 * all available schemas.
 */
function create () {
  const validator = new Validator()
  const directory = `${__dirname}${path.sep}`

  log.debug('Loading schemas', { directory })

  const schemas = fs.readdirSync(directory)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      log.debug('Loading schema', { file })
      return require(`./${file}`)
    })

  log.debug('Registering schemas', { count: schemas.length })

  for (let schema of schemas) {
    log.debug('Adding schema', { schema })
    validator.addSchema(schema)
  }

  return validator
}

const validator = create()

module.exports = {
  /**
   * The global validator singleton
   * @type {external:"jsonschema.Validator"}
   */
  validator
}
