const path = require('path')
const express = require('express')
const QuizzesService = require('./quizzes-service')
const QuizFlashSetsService = require('../quiz-flash-sets/quiz-flash-sets-service')
const { validateToken } = require('../middleware/validate-token')
const xss = require('xss')

const quizzesRouter = express.Router()
const jsonParser = express.json()

// FUNCTION TO SANITIZE QUIZZES
const sanitizeThatQuiz = (quiz) => {
     return quiz.quiz_name = xss(quiz.quiz_name)
}

// QUIZZES ROUTER FOR /API/QUIZZES ENDPOINT
quizzesRouter
    .route('/')
    // GET REQUEST, VALIDATES TOKEN, GETS ALL QUIZZES BY USERNAME
    .get(validateToken, (req, res, next) => {
        // GET KNEX INSTANCE FROM APP
        const knexInstance = req.app.get('db')
        // GET USERNAME FFROM USERINFO OBJECT PROVIDED BY JWT
        const { username } = req.userInfo
        // USE QUIZZES SERVICE OBJECT TO GET ALL QUIZZES BY USERNAME 
        QuizzesService.getAllQuizzesByUsername(knexInstance, username)
            .then(quizzes => {
                res.status(200).json(quizzes)
            })
            .catch(next)
    })

    // POST REQUEST, VALIDATES USER, ADDS QUIZ TO DATABASE
    .post(validateToken, jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        // EXTRACT QUIZ NAME AND FLASHCARD IDS FROM REQUEST BODY
        const { quiz_name, flashcardIds } = req.body
        const { username } = req.userInfo
        // DECLARE NEW QUIZ OBJECT TO SUBMIT
        const newQuiz = {
            quiz_name,
            username
        }
        
        // SANITIZE USER SUBMITTED INFO
        sanitizeThatQuiz(newQuiz)
        
        // USE QUIZZES SERVICE OBJECT TO POST NEW QUIZ
        QuizzesService.postQuiz(knexInstance, newQuiz)
            .then(quiz => {
                // LOOP THROUGH FLASHCARD IDS TO CREATE NEW SETS TO POST 
                for (let i = 0; i < flashcardIds.length; i++) {
                    const newSet = {
                        quiz_id: quiz.prime_quiz_id,
                        flash_id: flashcardIds[i]
                    }
                    // POST EACH NEW SET TO quiz_flash_sets
                    QuizFlashSetsService.postSet(knexInstance, newSet)
                } 
                res.status(201)
                   .location(`/api/quizzes/${quiz.prime_quiz_id}`)
                   .json(quiz)
            })
            .catch(next)

    })

// QUIZZES ROUTER FOR /API/QUIZZES/:QUIZID ENDPOINT
quizzesRouter
    .route('/:quizId')
    // ALL REQUESTS GO THROUGH THIS HANDLER, VALIDATES TOKEN AND ADDS QUIZ TO RESPONSE OBJECT TO BE MADE AVAILABLE TO SEND AS A RESPONSE
    .all(validateToken, (req, res, next) => {
        // GET QUIZ ID FROM THE REQUEST PARAMS
        const { quizId } = req.params
        const knexInstance = req.app.get('db')
        QuizzesService.getQuizById(knexInstance, quizId)
            .then(quiz => {
                console.log(quiz)
                // IF QUIZ ARRAY HAS A LENGTH THAT IS FALSY SEND 404 ERROR MESSAGE 
                if (!quiz.length) {
                    res.status(404).json({
                        error: { message: 'Quiz does not exist' }
                    })
                }

                // ADD QUIZ TO THE RESPONSE OBJECT 
                res.quiz = quiz
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        // ERRORS HANDLED ABOVE, RETURN 200 AND THE QUIZ
        res.status(200).json(res.quiz)
    })
    .delete((req, res, next) => {
        const { quizId } = req.params
        const knexInstance = req.app.get('db')
        // USE QUIZZES SERVICE OBJECT TO DELETE A QUIZ BY ID
        QuizzesService.deleteQuiz(knexInstance, quizId)
            .then(numRowsAffected => {
                // RETURN 204 NO CONTENT AND END THE PROCESS
                res.status(204).end()
            })
    })

module.exports = quizzesRouter