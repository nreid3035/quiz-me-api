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
        console.log(req.userInfo)
        const username = req.userInfo.username
        const knexInstance = req.app.get('db')
        FlashcardsService.getAllFlashcards(knexInstance, username)
            .then(flashcards => {
                res.status(200).json(flashcards)
            })
            .catch(next)
    })
    .post(validateToken, jsonParser, (req, res, next) => {
        const { question, answer } = req.body
        const { username } = req.userInfo
        console.log(username)
        const newFlashcard = {
            username: username,
            question: question,
            answer: answer
        }

        const knexInstance = req.app.get('db')
        FlashcardsService.postFlash(knexInstance, newFlashcard)
            .then(card => {
                res
                .status(201)
                .location(`/api/flashcards/${card.flashcard_id}`)
                .json(card)
            })
            .catch(next)
    })

flashcardsRouter
    .route('/:cardId')
    .all(validateToken, (req, res, next) => {
        console.log(req.params)
        const username = req.userInfo.username
        const knexInstance = req.app.get('db')
        const { cardId } = req.params
        FlashcardsService.getFlashById(knexInstance, cardId, username)
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
        const username = req.userInfo.username
        const knexInstance = req.app.get('db')
        const { cardId } = req.params

        FlashcardsService.deleteFlash(knexInstance, cardId, username)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = flashcardsRouter