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
            const msg = req.query.msg
            if (msg != null && msg != 'undefined') {
                res.render('error', { pageTitle: 'Error', message: msg })
                return
            }
            const entries = await logic.getEntries(req.session.team)
            if (entries.length === 0) {
                res.render('error', { pageTitle: 'Error', message: 'An error occurred while fetching entries.' })
            } else {
                res.render('index', { pageTitle: pageTitle, entries: entries, userType: req.session.type })
            }
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
        _id: req.body.objectId,
        date: req.body.date,
        rating: req.body.rating,
        zipcode: req.session.zipcode,
        team: req.session.team,
    }

    const msg = await logic.addEntry(query)
    if (msg != null && msg != undefined) {
        res.redirect('/')
    } else {
        res.redirect('/?msg=' + msg)
    }
})

app.post('/deleteentry', async (req, res) => {
    const entryId = req.body.objectId

    const msg = await logic.deleteEntry(entryId)
    if (msg != null && msg != undefined) {
        res.redirect('/')
    } else {
        res.redirect('/?msg=' + msg)
    }
})

app.post('/teamsadd', async (req, res) => {
    query = {
        _id: req.body.id,
        name: req.body.name
    }

    const msg = await logic.addTeam(query)
    if (msg != null && msg != undefined) {
        res.redirect('/')
    } else {
        res.redirect('/?msg=' + msg)
    }
})
app.get('/teamsdelete', async (req, res) => {
    const teamId = req.query.id
console.log(teamId)
    const msg = await logic.deleteTeam(teamId)
    if (msg != null && msg != undefined) {
        res.redirect('/')
    } else {
        res.redirect('/?msg=' + msg)
    }
})

app.post('/auth', async (req, res) => {
    // let username = request.body.username;
    let password = req.body.password
    // // if (username && password) {
    if (password) {
        const client = getClient()
        const db = client.db(databaseName)
        const users = db.collection('accounts')
        try {
            const filter = { team: 'Mill Street', active: true, password: password }
            const user = await users.findOne(filter)
            if (user != null) {
                req.session.loggedin = true
                req.session.team = user.team
                req.session.zipcode = user.zipcode
                req.session.type = user.type
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

// Admin Pages
app.get('/admin/entry_edit', async (req, res) => {
    const pageTitle = 'Entry Edit'
    const entryId = req.query.entryid
    const entry = await logic.getEntry(entryId)
    if (req.session.type == 'admin') {
        res.render('admin/entry_edit', { pageTitle: pageTitle, entry: entry })
    } else {
        res.redirect(req.get('Referrer'))
    }
})
app.get('/admin/entry_delete', async (req, res) => {
    const pageTitle = 'Entry Delete'
    if (req.session.type == 'admin') {
        const entryId = req.query.entryid
        const entry = await logic.getEntry(entryId)
        res.render('admin/entry_delete', { pageTitle: pageTitle, entry: entry })
    } else {
        res.redirect(req.get('Referrer'))
    }
})
app.get('/admin/teams_manage', async (req, res) => {
    const pageTitle = 'Teams: Manage'
    if (req.session.type == 'admin') {
        const teams = await logic.getTeams()
        res.render('admin/teams_manage', { pageTitle: pageTitle, teams: teams })
    } else {
        res.redirect(req.get('Referrer'))
    }
})
app.get('/admin/teams_edit', async (req, res) => {
    const pageTitle = 'Teams: Edit'
    if (req.session.type == 'admin') {
        const teamId = req.query.id
        const team = await logic.getTeam(teamId)
        res.render('admin/teams_edit', { pageTitle: pageTitle, team: team })
    } else {
        res.redirect(req.get('Referrer'))
    }
})
app.get('/admin/teams_new', async (req, res) => {
    const pageTitle = 'Teams: New'
    if (req.session.type == 'admin') {
        // const teams = await logic.getTeams()
        res.render('admin/teams_new', { pageTitle: pageTitle })
    } else {
        res.redirect(req.get('Referrer'))
    }
})


//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.redirect('/')
})

module.exports = app
