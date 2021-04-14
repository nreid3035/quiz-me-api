const knex = require('knex')
const app = require('./app')
const pg = require('pg')
pg.defaults.ssl = process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;


const { PORT, DATABASE_URL } = require('./config')

// ASSIGN A KNEX OBJECT TO A VARIABLE
const db = knex({
    client: 'pg',
    connection: DATABASE_URL
})

// SET THAT KNEX OBJECT TO APP TO BE AVAILABLE DURING REQUESTS
app.set('db', db)

app.listen(PORT, () => {
    console.log(`Server listening at ${PORT}`)
})