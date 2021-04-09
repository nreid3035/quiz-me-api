const app = require('../src/app')
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const { makeFlashArray } = require('./flashcards.fixtures')
const { makeQuizzesArray } = require('./quizzes.fixtures')
const { response } = require('express')
const bcrypt = require('bcrypt')

const password = 'pass123'
let testUserArray = []

const returnUsersArray = (hashedPass) => {
            return  [
                {
                    id: 78458,
                    first_name: 'Nicholas',
                    last_name: 'Reid',
                    username: 'Nreid3035',
                    email: 'nreid3035@gmail.com',
                    password: hashedPass  
                  },
                {
                    id: 9523,
                    first_name: 'Tom',
                    last_name: 'Seaver',
                    username: 'MetsMan99',
                    email: 'fakeemail@gmail.com',
                    password: hashedPass  
                  },
                  {
                    id: 845,
                    first_name: 'Janet',
                    last_name: 'Levinson',
                    username: 'JJRedLips',
                    email: 'myemail@gmail.com',
                    password: hashedPass   
                  },
                  {
                    id: 28,
                    first_name: 'Hannah',
                    last_name: 'Bozsik',
                    username: 'Hboz89',
                    email: 'hannahboz@gmail.com',
                    password: hashedPass  
                  },
                
            ]
        }

const makeUsersArray = (password) => {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return console.log(err)
        }
        console.log(returnUsersArray(hash))
        testUsersArray = returnUsersArray(hash)
        return
    })
}

console.log(makeUsersArray(password))
console.log(testUserArray)

describe('Quiz Me Endpoints', () => {
    let db
    let token = null

    before('make knex instance with test db', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    before('insert users into quiz_me_users', () => {
        
        return db
            .into('quiz_me_users')
            .insert(testUsersArray)
    })

    before('authenticate', () => {
        const loginInfo = {
            username: 'JJRedLips',
            password: 'pass123'
        }
        return supertest(app)
            .post('/api/login')
            .send(loginInfo)
            .expect(201)
            .then((err, response) => {
               if (err) {
                   console.log(err)

               }
               token = response.body.token
            })
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
              const testUsers = makeUsersArray(password)

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
              const testUsers = makeUsersArray(password)

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
            const testUsers = makeUsersArray(password)

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
          
      })

      describe('DELETE /api/users/:userId', () => {
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
              const testUsers = makeUsersArray(password)

              beforeEach('insert users', () => {
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
      describe.only('GET /api/flashcards', () => {
          context('Given no flashcards', () => {
              
              it('should respond with 200 and an empty array', () => {
                return supertest(app)
                    .get('/api/flashcards')
                    .set('session_token', token)
                    .expect(200, [])
              })
          })

          context('Given valid flashcards', () => {
              const testUsers = makeUsersArray(password)
              const testFlashcards = makeFlashArray()

              beforeEach('insert users, then flashcards', () => {
                     return db
                        .into('quiz_me_flashcards')
                        .insert(testFlashcards)
              })
              it('should respond with 200 and all flashcards associated with that user', () => {
                  return supertest(app)
                      .get('/api/flashcards')
                      .expect(testFlashcards)
              })
          })
      })

      describe('POST /api/flashcards', () => {
          context('Given an xss attack script', () => {
            it('should sanitize the card', () => {

            })
        })


          context('Given a valid request', () => {
            const testUsers = makeUsersArray(password)

            beforeEach('insert users', () => {
                return db
                    .into('quiz_me_users')
                    .insert(testUsers)
            })

            it('should respond with 201 and the new quiz', () => {
                const newFlash = {
                    userid: 1,
                    question: 'WHats A QuesTiON??',
                    answer: 'yes'
                }

                return supertest(app)
                    .post('/api/flashcards')
                    .send(newFlash)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.question).to.eql(newFlash.question)
                        expect(res.body.answer).to.eql(newFlash.answer)
                    })
                    .then(postRes => 
                        supertest(app)
                            .get(`/api/flashcards/${postRes.body.id}`)
                            .expect(postRes.body)
                        )
            })
          })

        //   context('Given a valid request', () => {
        //       const testUsers = makeUsersArray(password)
  
        //       beforeEach('insert users', () => {
        //           return db
        //               .into('quiz_me_users')
        //               .insert(testUsers)
        //       })

        //       it('should respond with 201 and the new flashcard', () => {
        //         const newFlashcard = {
        //             userid: 1,
        //             question: 'WhATs a QueSTiOn?',
        //             answer: 'Huh??'
        //         }

        //         return supertest(app)
        //             .post('/api/flashcards')
        //             .send(newFlashcard)
        //             .expect(201)
        //             .expect(res => {
        //                 expect(res.body).to.have.property('id')
        //                 expect(res.body.userid).to.eql(newFlashcard.userid)
        //                 expect(res.body.question).to.eql(newFlashcard.question)
        //                 expect(res.body.answer).to.eql(newFlashcard.answer)
        //             })
        //             .then(postRes =>
        //                 supertest(app)
        //                     .get(`api/flashcards/${postRes.body.id}`)
        //                     .expect(postRes.body)
        //                 )
        //       })
        //   })
      })

      describe('GET /api/flashcards/:flashId', () => {
          context('Given no flashcards', () => {
              it('should respond with 404 not found and an error message', () => {
                const id = 123456
                return supertest(app)
                    .get(`/api/flashcards/${id}`)
                    .expect(404, {
                        error: { message: 'Flashcard does not exist' }
                    })
              })
          })

          context('Given valid flashcards', () => {
              const testUsers = makeUsersArray(password)
              const testCards = makeFlashArray()
              beforeEach('insert users, then flashcards', () => {
                  return db
                      .into('quiz_me_users')
                      .insert(testUsers)
                      .then(() => {
                          return db
                            .into('quiz_me_flashcards')
                            .insert(testCards)
                      })
              })
            it('should respond with 200 and the appropriate flashcard', () => {
              const id = 2
              const expectedFlashcard = testCards[id -1]

              return supertest(app)
                  .get(`/api/flashcards/${id}`)
                  .expect(200, expectedFlashcard)
            })
          })
      })

      describe('DELETE /api/flashcards/:flashId', () => {
          context('Given no flashcards', () => {
              it('should respond with 404 not found and an error message', () => {
                const id = 123456
                return supertest(app)
                    .delete(`/api/flashcards/${id}`)
                    .expect(404, {
                        error: { message: 'Flashcard does not exist' }
                    })
              })
          })

          context('Given valid flashcards', () => {
              const testUsers = makeUsersArray(password)
              const testFlashcards = makeFlashArray()

              beforeEach('insert users, then flashcards', () => {
                  return db 
                      .into('quiz_me_users')
                      .insert(testUsers)
                      .then(() => {
                          return db
                              .into('quiz_me_flashcards')
                              .insert(testFlashcards)
                      })
              })
              it('should respond with 204', () => {
                const idToDelete = 2
                const expectedCards = testFlashcards.filter(card => card.id !== idToDelete)

                return supertest(app)
                    .delete(`/api/flashcards/${idToDelete}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/flashcards')
                            .expect(expectedCards)
                        )
              })
          })
      })   
  })

      describe('quiz_me_quizzes endpoints', () => {
          describe('GET /api/quizzes', () => {
              context('Given no quiz data', () => {
                  it('should respond with 200 and an empty array', () => {
                    return supertest(app)
                        .get('/api/quizzes')
                        .expect(200, [])
                  })
              })

              context('Given valid quiz data', () => {
                  const testUsers = makeUsersArray(password)
                  const testQuizzes = makeQuizzesArray()

                  beforeEach('insert users, then quizzes', () => {
                      return db 
                          .into('quiz_me_users')
                          .insert(testUsers)
                          .then(() => {
                              return db
                                  .into('quiz_me_quizzes')
                                  .insert(testQuizzes)
                          })
                  })
                  it('should respond with 200 and the corresponding array of quizzes for the user', () => {
                    return supertest(app)
                        .get('/api/quizzes')
                        .expect(testQuizzes) 
                  })
              })
          })

          describe('POST /api/quizzes', () => {
              context('Given an xss attack script', () => {
                  it('should sanitize the quiz', () => {

                  })
              })

              context('Given a valid request', () => {
                  const testUsers = makeUsersArray(password)
                  const testFlashcards = makeFlashArray()

                  beforeEach('insert users', () => {
                      return db
                          .into('quiz_me_users')
                          .insert(testUsers)
                  })
                  it('should respond with 201 and the created quiz', () => {
                    const newQuiz = {
                        card_ids: [1, 2],
                        quiz_name: 'Dev Quiz',
                        userid: 1
                    }

                    return supertest(app)
                        .post('/api/quizzes')
                        .send(newQuiz)
                        .expect(201)
                        .expect(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.card_ids).to.eql(newQuiz.card_ids)
                            expect(res.body.quiz_name).to.eql(newQuiz.quiz_name)
                            expect(res.body.userid).to.eql(newQuiz.userid)
                        })
                        .then(postRes =>
                            supertest(app)
                                .get(`/api/quizzes/${postRes.body.id}`)
                                .expect(postRes.body)
                            )
                  })
              })
          })

          describe('GET /api/quizzes/:quizId', () => {
              context('Given no quizzes', () => {
                  it('should respond with 404 not found and an error message', () => {
                    const id = 123456
                    return supertest(app)
                        .get(`/api/quizzes/${id}`)
                        .expect(404, {
                            error: { message: 'Quiz does not exist' }
                        })
                  })
              })

              context('Given valid quiz data', () => {
                  const testUsers = makeUsersArray(password)  
                  const testQuizzes = makeQuizzesArray()

                  beforeEach('insert users, then quizzes', () => {
                      return db
                          .into('quiz_me_users')
                          .insert(testUsers)
                          .then(() => {
                              return db 
                                  .into('quiz_me_quizzes')
                                  .insert(testQuizzes)
                          })
                  })
                  it('should respond with 200 and the corresponding quiz', () => {
                    const id = 2
                    const expectedQuiz = testQuizzes[id - 1]

                    return supertest(app)
                        .get(`/api/quizzes/${id}`)
                        .expect(200, expectedQuiz)
                  })
              })
          })

          describe('DELETE /api/quizzes/quizId', () => {
              context('Given no quiz data', () => {
                  it('should respond with 404 not found and an error message', () => {
                    const id = 123456
                    return supertest(app)
                        .delete(`/api/quizzes/${id}`)
                        .expect(404, {
                            error: { message: 'Quiz does not exist' }
                        })
                  })
              })

              context('Given a valid dataset of quizzes', () => {
                  const testUsers = makeUsersArray(password)
                  const testQuizzes = makeQuizzesArray()

                  beforeEach('insert users, then quizzes', () => {
                      return db
                          .into('quiz_me_users')
                          .insert(testUsers)
                          .then(() => {
                              return db
                                  .into('quiz_me_quizzes')
                                  .insert(testQuizzes)
                          })
                  })
                  it('should respond with 204', () => {
                    const idToDelete = 2
                    const expectedQuizzes = testQuizzes.filter(quiz => quiz.id !== idToDelete)

                    return supertest(app)
                        .delete(`/api/quizzes/${idToDelete}`)
                        .expect(204)
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