const fs = require('fs')
const path = require('path')
const config = require('config-yml')

const { microservice: { resources: { storage: { temp } } } } = config

module.exports.saveFileTo = async (file, fileName, destination = temp) => {
  try {
    const tempFolder = path.join(temp, destination)
    const uri = path.join(tempFolder, fileName)

    fs.mkdir(tempFolder, { recursive: true }, async err => {
      if (err) {
        console.log(err)
      }
      await new Promise(resolve =>
        file
          .pipe(fs.createWriteStream(uri))
          .on('error', (e) => console.log(e))
          .on('finish', resolve))
        .catch(e => console.log(e))
    })
  } catch (e) {
    console.log(e)
  }
}
