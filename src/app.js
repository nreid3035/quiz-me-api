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
const {JWT_SECRET} = require('./config')
const QuizFlashSetsService = require('./quiz-flash-sets/quiz-flash-sets-service')
const jsonParser = express.json()

const app = express()


const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common'


app.use(morgan(morganOption))
app.use(helmet())
console.log(CLIENT_ORIGIN)
app.use(cors({
    origin: CLIENT_ORIGIN
}))


// ENDPOINT FOR LOGGING INTO THE SITE
app.post('/api/login', jsonParser, (req, res, next) => {

    // EXTRACTS USERNAME AND PASSWORD FROM REQUEST BODY
    const { username, password } = req.body


    // USERS SERVICE OBJECT WILL GET THE USER BY THEIR UNIQUE USERNAME
    UsersService.getUserByUsername(
        req.app.get('db'),
        username
    ).then( user => {
        if(!user) {
            return res.status(404).json({
                error: { message: 'User does not exist' }  
            })
        }

        // DECLARE OBJECT TO STORE DATA IN THE JSON WEB TOKEN
        const sessionObj = {
            username : user.username,
            first_name: user.first_name,
            last_name: user.last_name
        }

        // USE BCRYPT COMPARE FUNCTION TO COMPARE THE PASSWORD FROM THE REQUEST, AND THE HASHED PASSWORD FROM THE DATABASE
        bcrypt.compare( password, user.password)
            .then(result => {
                if(result) {
                    jwt.sign(sessionObj, `${JWT_SECRET}`, { expiresIn: '60m'}, (err, token) => {
                        // IF NO ERRORS RETURN 201 AND THE TOKEN
                        if(!err) {
                            return res.status(201).json({token})
                        }
                        // ELSE RETURN 406 WITH A ERROR MESSAGE REGARDING TOKEN GENERATION
                         else {
                             res.status(406).json({
                                 error: { message: 'Error in token generation' }
                             })
                         }
                    })   
                } 
                // ELSE RETURN 401 AND AN ERROR MESSAGE REGARDING CREDENTIALS
                else {
                    res.status(401).json({
                        error: { message: 'Credential Error' }
                    })
                }
            }) 
    })
})

// ATTACH ROUTERS TO APP
app.use('/api/users', usersRouter)
app.use('/api/flashcards', flashcardsRouter)
app.use('/api/quizzes', quizzesRouter)


// ENDPOINT TO GET ALL SETS IN quiz_flash_sets
app.get('/api/sets', (req, res, next) => {
    QuizFlashSetsService.getAllSets(req.app.get('db'))
        .then(response => {
            res.status(200).json(response)
        })
        .catch(next)
})

// SIGNUP ENDPOINT, ADDS USER TO DATABASE
app.post('/api/signup', jsonParser, (req, res, next) => {
    
    // EXTRACT INFO FOR A NEW USER
    const { username, password, email, first_name, last_name } = req.body
    console.log(req.body)
    if (!username || !password || !email || !first_name || !last_name) {
        return res.status(400).json({
            error: { message: 'invalid input' }
        })
    }

    // HASH PASSWORD, SALT OF 10
    bcrypt.hash(password, 10)
        .then(hashPassword => {
            // DECLARE NEW USER OBJECT WITH HASHED PASSWORD INSTEAD OF THE INITIAL PW
            const newUser = {
                username,
                password: hashPassword,
                email,
                first_name,
                last_name
            }

            // USE SERVICE OBJECT TO POST A NEW USER TO THE DATABASE
            UsersService.postNewUser(
                req.app.get('db'),
                newUser
            ).then(user => {
                return res.status(201).json(user)
            })
        })
})

// FUNCTION TO HANDLE ERRORS
app.use(function errorHandler(error, req, res, next) {
    let response
    // IF IN PRODUCTION MODE ONLY SEND BACK SERVER ERROR
    if(NODE_ENV === 'production') {
        response = { error: { message: 'Server Error' }}
    } 
    // ELSE LOG FULL ERROR MESSAGE
    else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app
