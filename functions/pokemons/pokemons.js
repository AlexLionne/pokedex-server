const Pokedex = require('../../services/PokedexAPI')


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
    // https://stackoverflow.com/questions/5349425/whats-the-fastest-way-to-loop-through-an-array-in-javascript
    const max = generationDetails.length;
    let i = 0;
    for (; i < max; i++) {
        const [first, second, third] = generationDetails[i].pokemon_species

        delete generationDetails[i].abilities
        delete generationDetails[i].moves
        delete generationDetails[i].main_region
        delete generationDetails[i].version_groups
        delete generationDetails[i].types
        generationDetails[i].starter = [first, second, third]

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

    // https://stackoverflow.com/questions/5349425/whats-the-fastest-way-to-loop-through-an-array-in-javascript
    const max = pokemons.length;
    let i = 0;
    for (; i < max; i++) {
        delete pokemons[i].forms
        delete pokemons[i].game_indices
        delete pokemons[i].is_default
        delete pokemons[i].location_area_encounters
        delete pokemons[i].moves
        delete pokemons[i].past_types
    }


    // pagination
    const previous = page - 1 > 0 ? page - 1 : null
    const next = ((page + 1) * offset) >= pokemonGenerations.pokemon_species.length ? null : page + 1

    return res.status(200).send({previous: previous, next: next, results: pokemons.sort((pA, pB) => pB.id - pA.id)})
}

module.exports.getPokemonTypes = async (req, res) => {
    const PokedexAPI = await Pokedex
    const typeList = await PokedexAPI.getTypesList()
    let types = await PokedexAPI.getResource(typeList.results.map(type => type.url))

    // https://stackoverflow.com/questions/5349425/whats-the-fastest-way-to-loop-through-an-array-in-javascript
    const max = types.length;
    let i = 0;
    for (; i < max; i++) {
        delete types[i].generation
        delete types[i].game_indices
        delete types[i].pokemons
        delete types[i].past_damage_relations

        types[i].names = types[i].names.reduce((types, type) => (
            [
                ...types,
                {
                    [type.language.name]: type.name
                }
            ]
        ), [])
    }

    return res.status(200).send(types)
}

module.exports.getPokemonNames = async (req, res) => {
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
        return pokemon.url
    })
    let pokemonSpecies = await PokedexAPI.getResource(range)

    console.log(pokemonSpecies)
    // simplify result
    pokemonSpecies = pokemonSpecies.reduce((species, specie) => (
        [
            ...species,
            {
                [specie.name]: {
                    genus: specie.genera.reduce((genera, genus) => {
                        return {...genera, [genus.language.name]: genus.genus}
                    }, {}),
                    names: specie.names.reduce((names, name) => {
                        return {...names, [name.language.name]: name.name}
                    }, {})
                }
            }
        ]
    ), [])
    // pagination
    const previous = page - 1 > 0 ? page - 1 : null
    const next = ((page + 1) * offset) >= pokemonGenerations.pokemon_species.length ? null : page + 1

    return res.status(200).send({
        previous: previous,
        next: next,
        results: pokemonSpecies
    })
}
