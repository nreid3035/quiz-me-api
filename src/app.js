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
const bcrypt = require('bcrypt')
const UsersService = require('./users/users-service')
const jwt = require('jsonwebtoken')
const jsonParser = express.json()

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors({
    origin: CLIENT_ORIGIN
}))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    next()
})

app.post('/api/login', jsonParser, (req, res, next) => {
    const { username, password } = req.body


    UsersService.getUserByUsername(
        req.app.get('db'),
        username
    ).then( user => {
        if(!user) {
            return res.status(404).json({
                error: { message: 'User does not exist' }  
            })
        }

        const sessionObj = {
            username : user.username,
            first_name: user.first_name,
            last_name: user.last_name
        }

        bcrypt.compare( password, user.password)
            .then(result => {
                if(result) {
                    jwt.sign(sessionObj, 'secret', { expiresIn: '10m'}, (err, token) => {
                        if(!err) {
                            return res.status(200).json({token})
                        }
                         else {
                             res.status(406).json({
                                 error: { message: 'Error in token generation' }
                             })
                         }
                    })    
                } else {
                    res.status(401).json("Credential Error")
                }
            }) 
    })
})


app.use('/api/users', usersRouter)
app.use('/api/flashcards', flashcardsRouter)
app.use('/api/quizzes', quizzesRouter)

app.post('/api/signup', jsonParser, (req, res, next) => {
    const { username, password, email, first_name, last_name } = req.body

    if (!username) {
        return res.status(400).json({
            error: { message: 'invalid input' }
        })
    }

    bcrypt.hash(password, 10)
        .then(hashPassword => {
            const newUser = {
                username,
                password: hashPassword,
                email,
                first_name,
                last_name
            }

            UsersService.postNewUser(
                req.app.get('db'),
                newUser
            ).then(user => {
                return res.status(201).json(user)
            })
        })
})

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
