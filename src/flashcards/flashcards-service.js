const FlashcardsService = {
    // GETS ALL FLASHCARD INFO FROM quiz_me_flashcards WHERE THE USERNAME MATCHES
    getAllFlashcards(knex, username) {
        return knex
            .select('*')
            .from('quiz_me_flashcards')
            .where('username', username)
    },
    // GETS THE FIRST FLASHCARD FOUND IN quiz_me_flashcards WHERE THE ID AND USERNAME MATCH, RETURNS ALL INFO
    getFlashById(knex, id, username) {
        return knex
            .select('*')
            .from('quiz_me_flashcards')
            .where('username', username)
            .where('flashcard_id', id)
            .first()
    },
    // POSTS FLASHCARD TO quiz_me_flashcards, INSERTS THE NEWFLASH OBJECT IN THE PARAMETERS, RETURNS ALL
    postFlash(knex, newFlash) {
        return knex
            .into('quiz_me_flashcards')
            .insert(newFlash)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    // DELETES FLASHCARD IN quiz_me_flashcards WHERE ID AND USERNAME MATCH
    deleteFlash(knex, id, username) {
        return knex('quiz_me_flashcards')
            .where('username', username)
            .where('flashcard_id', id)
            .delete()
    }
}

module.exports = FlashcardsService