const QuizFlashSetsService = {
    getAllSets(knex) {
        return knex
            .select('*')
            .from('quiz_flash_sets')
    },
    postSet(knex, newSet) {
        return knex
            .insert(newSet)
            .into('quiz_flash_sets')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    }
}

module.exports = QuizFlashSetsService