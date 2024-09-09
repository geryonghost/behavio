const weatherapi_key = process.env.weatherapi_key

const axios = require('axios')
const { getClient, databaseName } = require('./db')

const appEmail = 'webmaster@comtily.com'

const lunarEmoji = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibboud': '🌖',
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
    const date = new Date(query.date)
    date.setDate(date.getDate() + 1)

    let details

    const apiURL =
        'http://api.weatherapi.com/v1/history.json?key=' +
        weatherapi_key +
        '&q=' +
        query.zipcode +
        '&dt=' +
        query.date

    try {
        const results = await axios.get(apiURL)

        if (results.status == '200') {
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
                cycles: {
                    ...astro,
                    day: day,
                    lunarEmoji: lunarEmoji[astro.moon_phase],
                },
                pressure_mb: pressure_mb,
                pressure_in: pressure_in,
                rating: query.rating,
                team: query.team,
            }

            const client = getClient()
            const db = client.db(databaseName)

            try {
                const filter = { date: query.date, team: query.team }
                const collection = db.collection('behaviors')
                await collection.updateOne(
                    filter,
                    { $set: details },
                    { upsert: true }
                )
            } catch (error) {
                console.error('Error', 'inserting into DB', error)
            }
        } else {
            console.log(
                'Error',
                'Failed to get WeatherAPI results',
                results.status
            )
            details =
                ('Error',
                'Failed to get WeatherAPI results',
                results.status)
        }
    } catch (error) {
        console.log('Error', 'Failed to get WeatherAPI results', error)
        details = ('Error', 'Failed to get WeatherAPI results', error)
    }
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
        entries = ('Error', 'getting entries from DB', error)
    }
    return entries
}

module.exports = {
    addEntry,
    getEntries,
}
