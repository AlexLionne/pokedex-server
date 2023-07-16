const Pokedex = require ('../../services/PokedexAPI')


/**
 * Get pokedex list
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

module.exports.getGenerationList = async (req, res) => {
    const PokedexAPI = await Pokedex
    //
    const generations = await PokedexAPI.getGenerationsList()
    let generationDetails = await Promise.all(generations.results.map(generation => PokedexAPI.getGenerationByName(generation.name)))

    // append starters pokemons to generations
    for (const generation of generationDetails) {
        const [first, second, third] = generation.pokemon_species
        generation.starter = await PokedexAPI.getResource([first.url, second.url, third.url])
    }

    return res.status(200).send(generationDetails)
}

module.exports.getPokemonsByGeneration = async (req, res) => {
    const PokedexAPI = await Pokedex
    //
    let {generation, page} = req.params
    const offset = parseInt(process.env.POKEMONS_PER_PAGE)

    page = parseInt(page)

    if (generation === undefined) {
        return res.status(400).send('No generation provided !')
    }

    if (page === undefined) {
        return res.status(400).send('No page provided !')
    }

    const pokemonGenerations = await PokedexAPI.getGenerationByName(`generation-${generation}`)
    const range = pokemonGenerations.pokemon_species.slice(page * offset, (page + 1) * offset).map(pokemon => pokemon.url)

    const pokemons = await PokedexAPI.getResource(range)

    // pagination
    const previous = page - 1 > 0 ? page - 1 : null
    const next = ((page + 1) * offset) >= pokemonGenerations.pokemon_species.length ? page : page + 1

    return res.status(200).send({previous, next, results: pokemons})
}
