const UsersService = {
    getAllUsers(knex) {
        return knex
            .select('*')
            .from('quiz_me_users')    
    },
    getUserById(knex, id) {
        return knex 
            .select('*')
            .from('quiz_me_users')
            .where('id', id)
            .first()
    }
}

module.exports = UsersService