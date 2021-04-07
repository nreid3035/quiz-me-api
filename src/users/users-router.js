const path = require('path')
const express = require('express')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

const { validateToken } = require('../middleware/validate-token')

usersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        UsersService.getAllUsers(knexInstance)
            .then(users => {
                res.status(200)
                res.json(users)
            })
            .catch(next)
    })

    usersRouter
    .route('/username-lookup')
    .get(validateToken, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { username } = req.userInfo
        UsersService.getUserByUsername(knexInstance, username)
            .then(user => {
                console.log(user)
                res.status(200).json(user)
            })
    })

usersRouter
    .route('/:userId')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const id = req.params.userId
        UsersService.getUserById(knexInstance, id)
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: { message: 'User does not exist' }
                    })
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.status(200).json(res.user)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const id = req.params.userId

        UsersService.deleteUser(knexInstance, id)
            .then(numRowsAffected => {
                res.status(204).end()
            }) 
            .catch(next)
    })

    


module.exports = usersRouter