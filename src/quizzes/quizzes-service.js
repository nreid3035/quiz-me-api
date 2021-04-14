const QuizzesService = {
    // GET ALL QUIZZES FROM quiz_me_quizzes WHERE USERNAME MATCHES
    getAllQuizzesByUsername(knex, username) {
        return knex
            .select('*')
            .from('quiz_me_quizzes')
            .where('username', username)
    },
    // GET QUIZ BY ID, SELECT NECCESSARY INFO FROM quiz_flash_sets WHERE ID MATCHES, JOIN quiz_me_quizzes and quiz_me_flashcards
    getQuizById(knex, id) {
        return knex
            .select('question', 'answer', 'quiz_name', 'flashcard_id')
            .from('quiz_flash_sets')
            .where('quiz_id', id)
            .join('quiz_me_quizzes', 'quiz_flash_sets.quiz_id', '=', 'quiz_me_quizzes.prime_quiz_id')
            .join('quiz_me_flashcards', 'quiz_flash_sets.flash_id', '=', 'quiz_me_flashcards.flashcard_id')           
        
    },
    // POST NEW QUIZ TO quiz_me_quizzes, RETURNS ALL
    postQuiz(knex, newQuiz) {
        return knex
            .insert(newQuiz)
            .into('quiz_me_quizzes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    // DELETE QUIZ FROM quiz_me_quizzes WHERE ID MATCHES
    deleteQuiz(knex, id) {
        return knex('quiz_me_quizzes')
            .where('prime_quiz_id', id)
            .delete()
    }
}

module.exports = QuizzesService