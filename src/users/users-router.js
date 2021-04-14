const path = require('path')
const express = require('express')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

const { validateToken } = require('../middleware/validate-token')

// USERS ROUTER FOR /API/USERS ENDPOINT
usersRouter
    .route('/')
    .get((req, res, next) => {
        // GET KNEX INSTANCE FROM APP
        const knexInstance = req.app.get('db')
        // USE SERVICE OBJECT TO GET ALL USERS
        UsersService.getAllUsers(knexInstance)
            .then(users => {
                // RETURN 200 AND USERS
                res.status(200)
                res.json(users)
            })
            .catch(next)
    })

    // USERNAME LOOKUP ENDPOINT TO GET NAME FOR GREETING
    usersRouter
    .route('/username-lookup')
    // GET REQUEST VALIDATES TOKEN, GETS USER BY USERNAME
    .get(validateToken, (req, res, next) => {
        const knexInstance = req.app.get('db')
        // GET USERNAME FROM USERINFO OBJECT PROVIDED BY JWT
        const { username } = req.userInfo
        UsersService.getUserByUsername(knexInstance, username)
            .then(user => {
                console.log(user)
                res.status(200).json(user)
            })
    })

// USERS ROUTER FOR /API/USERS/:USERID
usersRouter
    .route('/:userId')
    // HANLDES ALL REQUESTS TO THIS ENDPOINT
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        // GET USERID FROM REQUEST PARAMS
        const id = req.params.userId
        // USE USERS SERVICE OBJECT TO GET USER BY ID
        UsersService.getUserById(knexInstance, id)
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: { message: 'User does not exist' }
                    })
                }
                // ADD USER TO RESPONSE OBJECT TO BE RETURNED
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        // ERRORS HANDLED ABOVE, RETURN 200 AND THE USER
        res.status(200).json(res.user)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const id = req.params.userId

        // USE USERS SERICE OBJECT TO DELETE USER BY ID
        UsersService.deleteUser(knexInstance, id)
            .then(numRowsAffected => {
                // RETURN 204 NO CONTENT AND END THE PROCESS
                res.status(204).end()
            }) 
            .catch(next)
    })

    


module.exports = usersRouter