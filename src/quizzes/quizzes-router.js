const path = require('path')
const express = require('express')
const QuizzesService = require('./quizzes-service')
const QuizFlashSetsService = require('../quiz-flash-sets/quiz-flash-sets-service')
const { validateToken } = require('../middleware/validate-token')

const quizzesRouter = express.Router()
const jsonParser = express.json()

quizzesRouter
    .route('/')
    .get(validateToken, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { username } = req.userInfo
        QuizzesService.getAllQuizzesByUsername(knexInstance, username)
            .then(quizzes => {
                res.status(200).json(quizzes)
            })
            .catch(next)
    })
    .post(validateToken, jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { quiz_name, flashcardIds } = req.body
        const { username } = req.userInfo
        const newQuiz = {
            quiz_name,
            username
        }
        console.log(flashcardIds)
        
        QuizzesService.postQuiz(knexInstance, newQuiz)
            .then(quiz => {
                for (let i = 0; i < flashcardIds.length; i++) {
                    const newSet = {
                        quiz_id: quiz.prime_quiz_id,
                        flash_id: flashcardIds[i]
                    }
                    QuizFlashSetsService.postSet(knexInstance, newSet)
                } 
                res.status(201)
                   .location(`/api/quizzes/${quiz.prime_quiz_id}`)
                   .json(quiz)
            })
            .catch(next)

    })

quizzesRouter
    .route('/:quizId')
    .all(validateToken, (req, res, next) => {
        const { quizId } = req.params
        const knexInstance = req.app.get('db')
        console.log(quizId)
        QuizzesService.getQuizById(knexInstance, quizId)
            .then(quiz => {
                console.log(quiz)
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