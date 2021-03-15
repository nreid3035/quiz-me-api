require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const {CLIENT_ORIGIN} = require('./config')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const usersRouter = require('./users/users-router')
const flashcardsRouter = require('./flashcards/flashcards-router')
const quizzesRouter = require('./quizzes/quizzes-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors({
    origin: CLIENT_ORIGIN
}))

app.use('/api/users', usersRouter)
app.use('/api/flashcards', flashcardsRouter)
app.use('/api/quizzes', quizzesRouter)

app.get('/api/', (req, res) => {
    res.json({ok: true})
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if(NODE_ENV === 'production') {
        response = { error: { message: 'Server Error' }}
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app
