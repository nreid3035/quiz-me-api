require('dotenv').config()
const path = require('path')
const express = require('express')
const FlashcardsService = require('./flashcards-service')
const xss = require('xss')

const flashcardsRouter = express.Router()
const jsonParser = express.json()

const { validateToken } = require('../middleware/validate-token')

// FUNCTION FOR SANITIZING FLASHCARD REQUEST OBJECTS
const sanitizeThatFlashcard = (flashcard) => {
    flashcard.question = xss(flashcard.question)
    flashcard.answer = xss(flashcard.answer)
}

// FLASHCARDS ROUTER FOR /API/FLASHCARDS
flashcardsRouter
    .route('/')
    // GET FLASHCARDS REQUEST, VALIDATES TOKEN, GETS ALL FLASHCARDS FOR A SPECIFIC USER
    .get(validateToken, (req, res, next) => {
        // GRAB USERNAME FROM INFO PROVIDED BY JWT
        const username = req.userInfo.username
        // GET KNEX INSTANCE FROM APP
        const knexInstance = req.app.get('db')
        // GET ALL FLASHCARDS BY USERNAME
        FlashcardsService.getAllFlashcards(knexInstance, username)
            .then(flashcards => {
                res.status(200).json(flashcards)
            })
            .catch(next)
    })
    // POST FLASHCARD REQUEST, VALIDATES TOKEN, ADDS FLASHCARD TO DATABASE 
    .post(validateToken, jsonParser, (req, res, next) => {
        // GET QUESTION AND ANSWER FROM REQUEST BODY
        const { question, answer } = req.body
        const { username } = req.userInfo

        // DECLARE NEW FLASHCARD OBJECT
        const newFlashcard = {
            username: username,
            question: question,
            answer: answer
        }

        // SANITIZE USER PROVIDED FIELDS
        sanitizeThatFlashcard(newFlashcard)

        const knexInstance = req.app.get('db')
        // USE FLASHCARD SERVICE OBJECT TO POST THE NEW FLASHCARD TO DATABASE
        FlashcardsService.postFlash(knexInstance, newFlashcard)
            .then(card => {
                res
                .status(201)
                .location(`/api/flashcards/${card.flashcard_id}`)
                .json(card)
            })
            .catch(next)
    })


// FLASHCARDS ROUTER FOR /API/FLASHCARDS/:FLASHID ENDPOINTS
flashcardsRouter
    .route('/:cardId')
    // ALL REQUESTS PASS THROUGH THIS HANDLER, VALIDATES TOKEN, ASSIGNS SERVICE RESPONSE TO THE ROUTER RESPONSE TO BE RETURNED
    .all(validateToken, (req, res, next) => {
        const username = req.userInfo.username
        const knexInstance = req.app.get('db')
        // GET CARD ID FROM REQUEST PARAMS
        const { cardId } = req.params

        // GET FLASHCARD BY ID WITH USERNAME AS WELL
        FlashcardsService.getFlashById(knexInstance, cardId, username)
            .then(flashcard => {
                if (!flashcard) {
                    return res.status(404).json({
                        error: { message: 'Flashcard does not exist' }
                    })
                }
                // ASSIGN FLASHCARD TO RESPONSE OBJECT
                res.flashcard = flashcard
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        // ERRORS HANDLED ABOVE, RETURN 200 AND THE FLASHCARD FROM RESPONSE OBJECT
        res.status(200).json(res.flashcard)
    })
    .delete((req, res, next) => {
        const username = req.userInfo.username
        const knexInstance = req.app.get('db')
        const { cardId } = req.params
        
        // USE FLASHCARD SERVICE TO DELETE FLASHCARD
        FlashcardsService.deleteFlash(knexInstance, cardId, username)
            .then(numRowsAffected => {
                // RETURN 204 NO CONTENT AND END THE PROCESS
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = flashcardsRouter