const options = {
    protocol: 'https',
    versionPath: '/api/v2/',
    cacheLimit: 100 * 1000, // 100s
    timeout: 5 * 1000 // 5s
}

module.exports = new Promise((resolve => {
    import('pokedex-promise-v2').then((Pokedex) => {
        resolve(new Pokedex.default(options))
    })
}))
