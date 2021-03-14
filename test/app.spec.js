const app = require('../src/app')
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const { makeUsersArray } = require('./users.fixtures')


describe('Quiz Me Endpoints', () => {
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

afterEach('cleanup', () => db.raw('TRUNCATE quiz_me_users, quiz_me_quizzes, quiz_me_flashcards RESTART IDENTITY CASCADE'))

  describe('quiz_me_users endpoints', () => {
      describe('GET /api/users', () => {
          context('Given no user data', () => {
              it('should respond with 200 and an empty array', () => {
                return supertest(app)
                     .get('/api/users')
                     .expect([])
              })
          })

          context('Given valid user data', () => {
              const testUsers = makeUsersArray()

              beforeEach('insert users', () => {
                  return db 
                      .into('quiz_me_users')
                      .insert(testUsers)
              })
              it('should respond with 200 and all users', () => {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, testUsers)
              })
          })
      })
      describe('GET /api/users/:userId', () => {
          context('Given no users', () => {
            it('responds with 404 and an error message saying not found', () => {
              const id = 123456
              return supertest(app) 
                  .get(`/api/users/${id}`)
                  .expect(404, {
                      error: { message: 'User does not exist' }
                  })
            })   
          })

          context('Given an invalid user request', () => {
              const testUsers = makeUsersArray()

              beforeEach('insert users', () => {
                  return db 
                      .into('quiz_me_users')
                      .insert(testUsers)
              })
              it('responds with 404 and an error saying data is invalid', () => {
                  const id = 123456
                  return supertest(app)
                      .get(`/api/users/${id}`)
                      .expect(404, {
                          error: { message: 'User does not exist' }
                      }) 
              })
          })

          context('Given a vaild request for a user', () => {
            const testUsers = makeUsersArray()

            beforeEach('insert users', () => {
                return db
                    .into('quiz_me_users')
                    .insert(testUsers)
            })

            it('responds with 200 and the user', () => {
                const id = 2
                const expectedUser = testUsers[id - 1]
                
                return supertest(app)
                    .get(`/api/users/${id}`)
                    .expect(200, expectedUser)
            })
          })
      })

      describe('POST /api/users', () => {
          context('Given an xss attack script', () => {
            it('should sanitize the user', () => {

            })
        })

          context('Given a valid request', () => {
              it('responds with 201 and the created user', () => {
                  const newUser = {
                      first_name: 'First',
                      last_name: 'Last',
                      username: 'CrunchyOmlete32',
                      email: 'fakeemail@aol.com',
                      user_password: 'passy123'
                  }

                  return supertest(app)
                      .post('/api/users')
                      .send(newUser)
                      .expect(201)
                      .expect(res => {
                          expect(res.body).to.have.property('id')
                          expect(res.body.first_name).to.eql(newUser.first_name)
                          expect(res.body.last_name).to.eql(newUser.last_name)
                          expect(res.body.username).to.eql(newUser.username)
                          expect(res.body.email).to.eql(newUser.email)
                          expect(res.body.user_password).to.eql(newUser.user_password)
                      })
                      .then(postRes => 
                        supertest(app)
                            .get(`/api/users/${postRes.body.id}`)
                            .expect(postRes.body)
                        )
              })
          })
      })

      describe.only('DELETE /api/users/:userId', () => {
          context('Given an invalid request', () => {
              it('responds with 404 and an error message', () => {
                const id = 123456
                return supertest(app)
                    .delete(`/api/users/${id}`)
                    .expect(404, {
                        error: { message: 'User does not exist' }
                    })
              })
          })

          context('Given a valid request', () => {
              const testUsers = makeUsersArray()

              before('insert users', () => {
                  return db
                      .into('quiz_me_users')
                      .insert(testUsers)
              })

              it('responds with 204', () => {
                  const idToDelete = 2
                  const expectedUsers = testUsers.filter(user => user.id !== idToDelete)
                  
                  return supertest(app)
                      .delete(`/api/users/${idToDelete}`)
                      .expect(204)
                      .then(res => 
                        supertest(app)
                            .get('/api/users')
                            .expect(expectedUsers)
                      )
              })
          })
      })
  })

  describe('quiz_me_flashcards endpoints', () => {
      describe('GET /api/flashcards', () => {
          context('Given no flashcards', () => {
              it('should respond with 200 and an empty array', () => {

              })
          })

          context('Given valid flashcards', () => {
              it('should respond with 200 and all flashcards associated with that user', () => {

              })
          })
      })

      describe('POST /api/flashcards', () => {
          context('Given an invalid request', () => {
              it('should respond with 400 error and a message', () => {

              })
          })

          context('Given an xss attack script', () => {
            it('should sanitize the card', () => {

            })
        })

          context('Given a valid request', () => {
              it('should respond with 201 and the new flashcard', () => {

              })
          })
      })

      describe('GET /api/flashcards/:flashId', () => {
          context('Given no flashcards', () => {
              it('should respond with 404 not found and an error message', () => {

              })
          })

          context('Given a faulty request', () => {
              it('should respond with 404 not found and a message', () => {

              })
          })

          context('Given valid flashcards', () => {
            it('should respond with 200 and the appropriate flashcard', () => {

            })
          })
      })

      describe('DELETE /api/flashcards/:flashId', () => {
          context('Given no flashcards', () => {
              it('should respond with 404 not found and an error message', () => {

              })
          })

          context('Given an Id that does not exist', () => {
              it('should respond with 404 not found and an error message', () => {

              })
          })

          context('Given valid flashcards', () => {
              it('should respond with 204', () => {

              })
          })
      })   
  })

      describe('quiz_me_quizzes endpoints', () => {
          describe('GET /api/quizzes', () => {
              context('Given no quiz data', () => {
                  it('should respond with 200 and an empty array', () => {

                  })
              })

              context('Given valid quiz data', () => {
                  it('should respond with 200 and the corresponding array of quizzes for the user', () => {

                  })
              })
          })

          describe('POST /api/quizzes', () => {
              context('Given an invalid request', () => {
                  it('should respond with 400 and an error message saying the request was invalid', () =>{

                  })
              })

              context('Given an xss attack script', () => {
                  it('should sanitize the quiz', () => {

                  })
              })

              context('Given a valid request', () => {
                  it('should respond with 201 and the created quiz', () => {

                  })
              })
          })

          describe('GET /api/quizzes/:quizId', () => {
              context('Given no quizzes', () => {
                  it('should respond with 404 not found and an error message', () => {

                  })
              })

              context('Given valid quiz data', () => {
                  it('should respond with 200 and the corresponding quiz', () => {

                  })
              })
          })

          describe('DELETE /api/quizzes/quizId', () => {
              context('Given no quiz data', () => {
                  it('should respond with 404 not found and an error message', () => {

                  })
              })

              context('Given a valid dataset of quizzes', () => {
                  it('should respond with 204', () => {

                  })
              })
          })
      })





})



describe('App', () => {
    it('GET / responds with 200 containing "Hello World!"', () => {
        return supertest(app)
            .get('/')
            .expect(200, 'Hello World!')
    })
})