const databaseConnectionString = process.env.databaseConnectionString

const { MongoClient, ObjectId } = require('mongodb')

const databaseName = 'behavio'

let client

async function connectToDatabase() {
    client = new MongoClient(databaseConnectionString)
    await client.connect()
    console.log('Info Connected to MongoDB')
}

function getClient() {
    return client
}

function getObjectId(id) {
    const objectId = new ObjectId(id)
    return objectId
}

module.exports = { 
    connectToDatabase, 
    getClient, 
    getObjectId, 
    databaseName 
}
