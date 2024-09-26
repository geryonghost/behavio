appHost = process.env.host
appEnvironment = process.env.environment

const express = require('express')
const vhost = require('vhost')

const app = express()

// Define your different apps for each domain
const marketing = require('./marketing/server')
const application = require('./application/server')

// Use vhost middleware to route requests based on domain
if (appEnvironment == 'dev') {
    app.use(vhost('dev.behavio.cc', marketing))
    app.use(vhost('dev.app.behavio.cc', application))
} else {
    app.use(vhost('behavio.cc', marketing))
    app.use(vhost('app.behavio.cc', application))

    app.use(
        vhost('www.behavio.cc', function (req, res) {
            res.set('location', 'https://behavio.cc')
            res.status(301).send()
        })
    )
}
// Add a default route or handle unrecognized domains
app.listen(3000, appHost, () => {
    console.log('Server is running on port 3000')
})
