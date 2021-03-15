const path = require('path')
const express = require('express')
const QuizzesService = require('./quizzes-service')

const quizzesRouter = express.Router()
const jsonParser = express.json()

quizzesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        QuizzesService.getAllQuizzes(knexInstance)
            .then(quizzes => {
                res.status(200).json(quizzes)
            })
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { card_ids, quiz_name, userid } = req.body
        const newQuiz = {
            card_ids,
            quiz_name,
            userid
        }

        QuizzesService.postQuiz(knexInstance, newQuiz)
            .then(quiz => {
                res.status(201)
                   .location(`/api/quizzes/${quiz.id}`)
                   .json(quiz)
            })
            .catch(next)

    })

quizzesRouter
    .route('/:quizId')
    .all((req, res, next) => {
        const { quizId } = req.params
        const knexInstance = req.app.get('db')

        QuizzesService.getQuizById(knexInstance, quizId)
            .then(quiz => {
                if (!quiz) {
                    res.status(404).json({
                        error: { message: 'Quiz does not exist' }
                    })
                }

                res.quiz = quiz
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.status(200).json(res.quiz)
    })
    .delete((req, res, next) => {
        const { quizId } = req.params
        const knexInstance = req.app.get('db')

        QuizzesService.deleteQuiz(knexInstance, quizId)
            .then(numRowsAffected => {
                res.status(204).end()
            })
    })

module.exports = quizzesRouter