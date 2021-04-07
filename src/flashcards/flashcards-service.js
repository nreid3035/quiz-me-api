const FlashcardsService = {
    getAllFlashcards(knex, username) {
        return knex
            .select('*')
            .from('quiz_me_flashcards')
            .where('username', username)
    },
    getFlashById(knex, id, username) {
        return knex
            .select('*')
            .from('quiz_me_flashcards')
            .where('username', username)
            .where('flashcard_id', id)
            .first()
    },
    postFlash(knex, newFlash) {
        return knex
            .into('quiz_me_flashcards')
            .insert(newFlash)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteFlash(knex, id, username) {
        return knex('quiz_me_flashcards')
            .where('username', username)
            .where('flashcard_id', id)
            .delete()
    }
}

module.exports = FlashcardsService