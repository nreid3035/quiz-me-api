const QuizzesService = {
    getAllQuizzes(knex) {
        return knex
            .select('*')
            .from('quiz_me_quizzes')
    },
    getQuizById(knex, id) {
        return knex
            .select('*')
            .from('quiz_me_quizzes')
            .where('id', id)
            .first()
    },
    postQuiz(knex, newQuiz) {
        return knex
            .insert(newQuiz)
            .into('quiz_me_quizzes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteQuiz(knex, id) {
        return knex('quiz_me_quizzes')
            .where({ id })
            .delete()
    }
}

module.exports = QuizzesService