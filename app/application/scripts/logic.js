const weatherapi_key = process.env.weatherapi_key

const axios = require('axios')
const { getClient, getObjectId, databaseName } = require('./db')

const appEmail = 'webmaster@comtily.com'

const lunarEmoji = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
}

const dayOfWeek = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
}

// Add Entry
async function addEntry(query) {
    console.log('Add entry')
    const date = new Date(query.date)
    date.setDate(date.getDate() + 1)

    const backDate = new Date()
    backDate.setDate(backDate.getDate() - 7)
    
    if (date > backDate) {
        console.log('Valid entry')
        let details

        const apiURL = 'http://api.weatherapi.com/v1/history.json?key=' + weatherapi_key + '&q=' + query.zipcode + '&dt=' + query.date
        try {
            const results = await axios.get(apiURL)

            if (results.status == '200') {
                console.log('WeatherAPI Success')
                const astro = results.data.forecast.forecastday[0].astro
                const day = dayOfWeek[date.getDay()]

                let pressure_mb = []
                let pressure_in = []
                for (
                    let i = 0;
                    i < results.data.forecast.forecastday[0].hour.length;
                    i++
                ) {
                    pressure_mb.push(
                        results.data.forecast.forecastday[0].hour[i].pressure_mb
                    )
                    pressure_in.push(
                        results.data.forecast.forecastday[0].hour[i].pressure_in
                    )
                }

                details = {
                    date: query.date,
                    cycles: {
                        ...astro,
                        day: day,
                    },
                    pressure_mb: pressure_mb,
                    pressure_in: pressure_in,
                    rating: Number(query.rating),
                    team: query.team,
                }
            } else {
                console.log('Error', 'Failed to get WeatherAPI results', results.status)
            }
        } catch (error) {
            console.log('Error', 'Failed to get WeatherAPI results', error.response.data.error)
        }

        try {
            if (details != null) {
                const client = getClient()
                const db = client.db(databaseName)
                
                let objectId
                if (query._id != null) {
                    objectId = getObjectId(query._id)
                } else {
                    objectId = getObjectId()
                }

                const collection = db.collection('behaviors')
                await collection.updateOne(
                    // filter,
                    { _id: objectId },
                    { $set: details },
                    { upsert: true }
                )
            }
        } catch (error) {
            console.error('Error', 'inserting into DB', error)
        }
        
    } else {
        const msg = 'Entry is too old. Beyond 7 days'
        return msg
    }
}

async function deleteEntry(entryId) {
    console.log('Delete entry')
    const client = getClient()
    const db = client.db(databaseName)

    const objectId = getObjectId(entryId)
    let entry
    try {
        const collection = db.collection('behaviors')
        entry = await collection.deleteOne({'_id': objectId})
    } catch (error) {
        console.error('Error', 'getting entries from DB', error)
        entry = null
    }
    return entry
}

async function getEntry(entryId) {
    const client = getClient()
    const db = client.db(databaseName)

    const objectId = getObjectId(entryId)
    let entry
    try {
        const collection = db.collection('behaviors')
        entry = await collection.findOne({'_id': objectId})
    } catch (error) {
        console.error('Error', 'getting entries from DB', error)
        entry = null
    }
    return entry
}

async function getEntries(team) {
    const client = getClient()
    const db = client.db(databaseName)
    let entries
    try {
        const collection = db.collection('behaviors')
        const filter = { team: team }
        const sort = { date: -1 }
        entries = await collection.find(filter).sort(sort).toArray()
    } catch (error) {
        console.error('Error', 'getting entries from DB', error)
        entries = []
    }
    return entries
}

async function addTeam(query) {
    console.log('Add team')

    try {
        if (query != null) {
            const client = getClient()
            const db = client.db(databaseName)

            let objectId
            if (query._id != null) {
                objectId = getObjectId(query._id)
            } else {
                objectId = getObjectId()
            }

            const details = {
                name: query.name
            }

            const collection = db.collection('teams')
            await collection.updateOne(
                { _id: objectId },
                { $set: details },
                { upsert: true }
            )
        }
    } catch (error) {
        console.error('Error', 'inserting team into DB', error)
    }
}
async function deleteTeam(teamId) {
    console.log('Delete team')
    const client = getClient()
    const db = client.db(databaseName)

    const objectId = getObjectId(teamId)
    let team
    try {
        const collection = db.collection('teams')
        team = await collection.deleteOne({'_id': objectId})
    } catch (error) {
        console.error('Error', 'deleting team from DB', error)
        team = null
    }
    return team
}

async function getTeam(teamId) {
    const client = getClient()
    const db = client.db(databaseName)

    const objectId = getObjectId(teamId)
    let team
    try {
        const collection = db.collection('teams')
        team = await collection.findOne({'_id': objectId})
    } catch (error) {
        console.error('Error', 'getting team from DB', error)
        team = null
    }
    return team
}

async function getTeams() {
    const client = getClient()
    const db = client.db(databaseName)

    let teams
    try {
        const collection = db.collection('teams')
        teams = await collection.find().toArray()
    } catch (error) {
        console.error('Error', 'getting teams from DB', error)
        teams = null
    }
    return teams
}

async function addUser(query) {
    console.log('Add user')

    try {
        if (query != null) {
            const client = getClient()
            const db = client.db(databaseName)

            let objectId
            if (query._id != null && query._id != '') {
                objectId = getObjectId(query._id)
            } else {
                objectId = getObjectId()
            }
            
            const details = {
                name: query.name,
                team: query.team,
                zipcode: query.zipcode,
                type: query.type,
                password: query.password,
                active: true
            }

            const collection = db.collection('accounts')
            await collection.updateOne(
                { _id: objectId },
                { $set: details },
                { upsert: true }
            )
        }
    } catch (error) {
        console.error('Error', 'inserting user into DB', error)
    }
}
async function deleteUser(userId) {
    console.log('Delete user')
    const client = getClient()
    const db = client.db(databaseName)

    const objectId = getObjectId(userId)
    let user
    try {
        const collection = db.collection('accounts')
        user = await collection.deleteOne({'_id': objectId})
    } catch (error) {
        console.error('Error', 'deleting user from DB', error)
        user = null
    }
    return user
}

async function getUser(userId) {
    const client = getClient()
    const db = client.db(databaseName)

    const objectId = getObjectId(userId)
    let user
    try {
        const collection = db.collection('accounts')
        user = await collection.findOne({'_id': objectId})
    } catch (error) {
        console.error('Error', 'getting user from DB', error)
        user = null
    }
    return user
}

async function getUsers() {
    const client = getClient()
    const db = client.db(databaseName)

    let users
    try {
        const collection = db.collection('accounts')
        users = await collection.find().toArray()
    } catch (error) {
        console.error('Error', 'getting users from DB', error)
        users = null
    }
    return users
}

module.exports = {
    addEntry,
    deleteEntry,
    getEntry,
    getEntries,
    addTeam,
    deleteTeam,
    getTeam,
    getTeams,
    addUser,
    deleteUser,
    getUser,
    getUsers,
}
