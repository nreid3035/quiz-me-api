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
    },
    postNewUser(knex, newUser) {
        return knex
            .into('quiz_me_users')
            .insert(newUser)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteUser(knex, id) {
        return knex('quiz_me_users')
            .where({ id })
            .delete()
    } 
}

module.exports = UsersService