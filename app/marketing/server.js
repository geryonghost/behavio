appEnvironment = process.env.environment

const express = require('express')
const app = express()
const { render } = require('ejs')

app.set('view engine', 'ejs')
app.set('views', `${__dirname}/views`)
app.use(express.static(`${__dirname}/public`))

app.get('', async (req, res) => {
    const pageTitle = "Behavio"
    res.render('index', { appEnvironment: appEnvironment, pageTitle: pageTitle })
})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.redirect('/')
})

module.exports = app
