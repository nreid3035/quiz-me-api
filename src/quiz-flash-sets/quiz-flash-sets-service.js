const QuizFlashSetsService = {
    // GET ALL SETS FROM quiz_flash_sets
    getAllSets(knex) {
        return knex
            .select('*')
            .from('quiz_flash_sets')
    },
    // POST NEW SET TO quiz_flash_sets, RETURNS ALL
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