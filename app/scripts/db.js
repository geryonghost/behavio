// const databaseConnectionString = process.env.databaseConnectionString
const databaseConnectionString = 'mongodb://localhost:27017'

const { MongoClient } = require('mongodb')

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

module.exports = { connectToDatabase, getClient, databaseName }
