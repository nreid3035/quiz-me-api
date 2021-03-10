const knex = require('knex')
const app = require('./app')
const pg = require('pg')
pg.defaults.ssl = process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;


const { PORT, DB_URL } = require('./config')

const db = knex({
    client: 'pg',
    connection: DB_URL
})

app.set('db', db)

app.listen(PORT, () => {
    console.log(`Server listening at ${PORT}`)
})