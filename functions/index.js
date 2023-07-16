/* Pokemons */
Object.keys(require('./pokemons/pokemons')).map(key => module.exports[key] = require('./pokemons/pokemons')[key])
