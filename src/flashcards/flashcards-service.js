const FlashcardsService = {
    getAllFlashcards(knex) {
        return knex
            .select('*')
            .from('quiz_me_flashcards')
    },
    getFlashById(knex, id) {
        return knex
            .select('*')
            .from('quiz_me_flashcards')
            .where('id', id)
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
    deleteFlash(knex, id) {
        return knex('quiz_me_flashcards')
            .where({ id })
            .delete()
    }
}

module.exports = FlashcardsService