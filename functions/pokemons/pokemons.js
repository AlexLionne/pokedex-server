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
        delete generation.abilities
        delete generation.moves
        delete generation.main_region
        delete generation.version_groups
        delete generation.types
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

    const pokemonGenerations = await PokedexAPI.getGenerationByName(generation)
    const range = pokemonGenerations.pokemon_species.slice(page * offset, (page + 1) * offset).map(pokemon => {
        return pokemon.url.replace('-species', '')
    })

    const pokemons = await PokedexAPI.getResource(range)

    for (const pokemon of pokemons) {
        delete pokemon.forms
        delete pokemon.game_indices
        delete pokemon.is_default
        delete pokemon.location_area_encounters
        delete pokemon.moves
        delete pokemon.past_types
        delete pokemon.species
    }
    // pagination
    const previous = page - 1 > 0 ? page - 1 : null
    const next = ((page + 1) * offset) >= pokemonGenerations.pokemon_species.length ? null : page + 1

    return res.status(200).send({previous: previous, next: next, results: pokemons.sort((pA, pB) => pB.id - pA.id)})
}

module.exports.getPokemonTypes = async (req, res) => {
    const PokedexAPI = await Pokedex
    const types = await PokedexAPI.getTypesList()
    console.log(types)
    res.status(200).send(types)
}
