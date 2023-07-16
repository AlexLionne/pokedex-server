const microservice = require("@nesga-arc/microservice-boilerplate");
const request = require('axios')
const {POKEMONS_STARTERS} = require("../constants/constants");
jest.useFakeTimers();

describe('Pokemon Microservice Tests', () => {
    const options = {
        name: 'Microservice', functions: '../../functions/index.js',
        port: 4001,
        routes: [
            {
                name: 'getGenerationList',
                method: 'GET',
                endpoint: '/generations',
                middlewares: []
            },
            {
                name: 'getPokemonsByGeneration',
                method: 'GET',
                endpoint: '/pokemons/:generation/:page',
                middlewares: [],
            }
        ],
        events: [
            {
                name: 'addGeneration',
                description: 'add a generation of pokemon, trigger a WS event when a wild new generation appears'
            },
            {
                name: 'updatePokemon',
                description: 'update a pokemon {id, attrs, values}'
            }
        ]
    }

    const api = request.create({
        baseURL: `http://127.0.0.1:${options.port}`, timeout: 60000 * 2
    });

    let {start, stop} = microservice(options)

    beforeAll(async () => {
        start()
    }, 15000)

    afterAll(async () => {
        stop()
    }, 15000)

    describe('Generation Tests', () => {
        it('Starters of generations should have correct number of pokemons', async function () {
            const generations = await api.get('/generations')
            for (const generation of generations.data) {
                console.log(generation.name, generation.starter.length, POKEMONS_STARTERS[generation.name])
                expect(generation.starter.length).toBe(parseInt(POKEMONS_STARTERS[generation.name]))
            }
        })
    })
})
