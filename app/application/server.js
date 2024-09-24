const appEnvironment = process.env.environment
const appStatus = process.env.status

const express = require('express')
const app = express()
const { render } = require('ejs')

const session = require('express-session')
const MongoStore = require('connect-mongo')

// Custom functions
const logic = require('./scripts/logic')
const { connectToDatabase, getClient, databaseName } = require('./scripts/db')
connectToDatabase()

app.set('view engine', 'ejs')
app.set('views', `${__dirname}/views`)
app.use(express.static(`${__dirname}/public`))
app.use(express.urlencoded({ extended: true }))

app.use(
    session({
        secret: 'pnr.tjb0apx6VBK1trv',
        resave: true,
        saveUninitialized: false,
        store: new MongoStore({ client: getClient(), databaseName: databaseName }),
    })
)

app.get('', async (req, res) => {
    // req.session.loggedin = true
    // req.session.team = 'Mill Street'
    if (appStatus != 'maintenance') {
        if (req.session.loggedin) {
            const pageTitle = 'Behavio'
            const entries = await logic.getEntries(req.session.team)
            res.render('index', { pageTitle: pageTitle, entries: entries })
        } else {
            const pageTitle = 'Login'
            res.redirect('/login')
        }
    } else {
    res.render('maintenance')
    }
})

app.get('/login', (req, res) => {
    const pageTitle = 'Login'
    const isLoggedOut = true
    res.render('login', { pageTitle: pageTitle, isLoggedOut })
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

app.post('/addentry', async (req, res) => {
    query = {
        date: req.body.date,
        rating: req.body.rating,
        zipcode: req.session.zipcode,
        team: req.session.team,
    }

    logic.addEntry(query)
    res.redirect('/')
})

app.post('/auth', async (req, res) => {
    // let username = request.body.username;
    let password = req.body.password
    console.log(password)
    // // if (username && password) {
    if (password) {
        const client = getClient()
        console.log(client)
        const db = client.db(databaseName)

        const users = db.collection('accounts')
        try {
            const filter = { team: 'Mill Street', password: password }
            console.log(filter)
            const user = await users.findOne(filter)
            console.log(user)
            if (user != null) {
                req.session.loggedin = true
                req.session.team = user.team
                req.session.zipcode = user.zipcode
                res.redirect('/')
            } else {
                const error = 'Bad login'
                console.error('BEH:Error', 'Bad login')
            }
        } catch (error) {
            console.error('BEH:Error', error)
        }
    } else {
        const error = 'Empty login'
        console.error('BEH:Error', 'Empty Login')
    }
})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.redirect('/')
})

module.exports = app
