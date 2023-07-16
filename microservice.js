const Microservice = require('@nesga-arc/microservice-boilerplate')
const functions = require('./functions')
const { microservice } = require('config-yml')
const service = new Microservice(microservice)

Object.keys(functions).map(key => module.exports[key] = functions[key])

service.start()
