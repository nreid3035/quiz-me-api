require('dotenv').config()
const path = require('path')
const express = require('express')
const FlashcardsService = require('./flashcards-service')

const flashcardsRouter = express.Router()
const jsonParser = express.json()

const { validateToken } = require('../middleware/validate-token')

flashcardsRouter
    .route('/')
    .get(validateToken, (req, res, next) => {
        const knexInstance = req.app.get('db')
        FlashcardsService.getAllFlashcards(knexInstance)
            .then(flashcards => {
                res.status(200).json(flashcards)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { userid, question, answer } = req.body
        const newFlashcard = {
            userid: userid,
            question: question,
            answer: answer
        }

        const knexInstance = req.app.get('db')
        FlashcardsService.postFlash(knexInstance, newFlashcard)
            .then(card => {
                res
                .status(201)
                .location(`/api/flashcards/${card.id}`)
                .json(card)
            })
            .catch(next)
    })

flashcardsRouter
    .route('/:cardId')
    .all((req, res, next) => {
        console.log(req.params)
        const knexInstance = req.app.get('db')
        const { cardId } = req.params
        FlashcardsService.getFlashById(knexInstance, cardId)
            .then(flashcard => {
                if (!flashcard) {
                    return res.status(404).json({
                        error: { message: 'Flashcard does not exist' }
                    })
                }
                res.flashcard = flashcard
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.status(200).json(res.flashcard)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { cardId } = req.params

        FlashcardsService.deleteFlash(knexInstance, cardId)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = flashcardsRouter