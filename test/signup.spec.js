const app = require('../src/app')
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

// FUNCTION TO RETURN AN ARRAY OF USERS DATA FOR TESTING
const returnUsersArray = (hashedPass) => {
    return  [
        {
            id: 1,
            first_name: 'Nicholas',
            last_name: 'Reid',
            username: 'Nreid3035',
            email: 'nreid3035@gmail.com',
            password: hashedPass  
          },
        {
            id: 2,
            first_name: 'Tom',
            last_name: 'Seaver',
            username: 'MetsMan99',
            email: 'fakeemail@gmail.com',
            password: hashedPass  
          },
          {
            id: 3,
            first_name: 'Janet',
            last_name: 'Levinson',
            username: 'JJRedLips',
            email: 'myemail@gmail.com',
            password: hashedPass   
          },
          {
            id: 4,
            first_name: 'Hannah',
            last_name: 'Bozsik',
            username: 'Hboz89',
            email: 'hannahboz@gmail.com',
            password: hashedPass  
          },
        
    ]
}

// FUNCTION TO HASH PASSWORD AND RETURN USERS TEST ARRAY
const makeUsersArray = (password) => {
const cryptedPass = bcrypt.hashSync(password, 10)
return returnUsersArray(cryptedPass)
}

describe('Quiz Me Signup Endpoints', () => {
    let db 

    before('make knex instance with test db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('quiz_me_users'))

    afterEach('cleanup', () => db.raw('TRUNCATE quiz_me_users RESTART IDENTITY CASCADE'))

    describe('POST /api/signup', () => {
        context('given a valid signup request', () => {
            it('should respond with 201 and the new user', () => {
              const validSignup = {
                  first_name: 'Chuck',
                  last_name: 'Norris',
                  username: 'TestsTakeChuckNorris',
                  password: 'pass123',
                  email: 'ChuckyBoi@fakeemail.com'
              }
  
              return supertest(app)
                  .post('/api/signup')
                  .send(validSignup)
                  .expect(201)
                  .expect(res => {
                      expect(res.body).to.have.property('id')
                      expect(res.body.first_name).to.eql(validSignup.first_name)
                      expect(res.body.last_name).to.eql(validSignup.last_name)
                      expect(res.body.email).to.eql(validSignup.email)
                      expect(res.body.username).to.eql(validSignup.username)
                  })
            })
        })
  
        context('given an invalid signup request', () => {
            it('should respond with 400 bad request and a message saying invalid input', () => {
              const invalidSignup = {
                  first_name: 'Name',
                  name: 'faulty name',
                  username: 'Nreid3035',
                  password: '',
              }
  
              return supertest(app)
                  .post('/api/signup')
                  .send(invalidSignup)
                  .expect(400)
            })
        })
    })

    describe('POST /api/login', () => {
        const testUsers = makeUsersArray('pass123')
        beforeEach('insert users into table', () => {
            return db
                .into('quiz_me_users')
                .insert(testUsers)
        })
        context('given a valid username and password', () => {
            it('responds with 201 and the users json web token', () => {
                const loginInfo = {
                    username: 'Nreid3035',
                    password: 'pass123'
                }

                return supertest(app)
                    .post('/api/login')
                    .send(loginInfo)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('token')
                    })
            })
        })

        context('given an invalid username', () => {
            it('should respond with 404 and a message saying user does not exist', () => {
                const loginInfo = {
                    username: 'invalidName',
                    password: 'pass123'
                }

                return supertest(app)
                    .post('/api/login')
                    .send(loginInfo)
                    .expect(404, {
                        error: { message: 'User does not exist'}
                    })
            })
        })

        context('given an invalid password', () => {
            it('should respond with 401 and a message saying credential error', () => {
                const loginInfo = {
                    username: 'Nreid3035',
                    password: 'wrongpassword'
                }

                return supertest(app)
                    .post('/api/login')
                    .send(loginInfo)
                    .expect(401, {
                        error: { message: 'Credential Error' } 
                    })
            })
        })
    })
})