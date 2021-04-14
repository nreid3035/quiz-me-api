const app = require('../src/app')
const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const { makeFlashArray } = require('./flashcards.fixtures')
const { makeQuizzesArray } = require('./quizzes.fixtures')
const { makeSetsArray } = require('./quiz-flash-sets.fixtures')
const { response } = require('express')
const bcrypt = require('bcrypt')

// TEST VARIABLES
const username = 'Nreid3035'
const password = 'pass123'

// FUNCTION TO CREATE TEST USERS
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

// HASHES PASSWORD AND RETURNS USERS ARRAY
const makeUsersArray = (password) => {
    const cryptedPass = bcrypt.hashSync(password, 10)
    return returnUsersArray(cryptedPass)
}

// TEST DATA SETS
const testUsers = makeUsersArray(password)
const testFlashcards = makeFlashArray()
const testQuizzes = makeQuizzesArray()
const testSets = makeSetsArray()
const loginInfo = {
        username: 'Nreid3035',
        password: 'pass123'   
    }

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


after('disconnect from db', () => db.destroy())

before('clean the table', () => db('quiz_me_users'))

beforeEach('insert table data, authenticate user', () => {
    

    // POPULATE DATABASE WITH TEST DATA SETS BEFORE EACH TEST, THEN LOGIN AND ASSIGN TOKEN TO GLOBAL VARIABLE
    return db
        .into('quiz_me_users')
        .insert(testUsers)
        .then(() => {
            return db 
                .into('quiz_me_flashcards')
                .insert(testFlashcards)
                .then(() => {
                    return db 
                        .into('quiz_me_quizzes')
                        .insert(testQuizzes)
                        .then(() => {
                            return db
                                .into('quiz_flash_sets')
                                .insert(testSets)
                                .then(() => {
                              return supertest(app)
                                  .post('/api/login')
                                  .send(loginInfo)
                                  .expect(201)
                                  .then(res => {
                                    token = res.body.token
                                })
                            })
                        })
                })
        })
})

// CLEAR ALL TABLES AFTER EACH TEST
afterEach('cleanup', () => db.raw('TRUNCATE quiz_me_users, quiz_me_quizzes, quiz_me_flashcards, quiz_flash_sets RESTART IDENTITY CASCADE'))

  

  describe('quiz_me_users endpoints', () => {
      describe('GET /api/users', () => {
          context('Given no user data', () => {
              beforeEach('remove users from table', () => {
                  return db.raw('TRUNCATE quiz_me_users RESTART IDENTITY CASCADE;')
              })
              it('should respond with 200 and an empty array', () => {
                return supertest(app)
                     .get('/api/users')
                     .expect(200, [])
              })
          })

          context('Given valid user data', () => {
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

          context('Given a vaild request for a user', () => {
            it('responds with 200 and the user', () => {
                const id = 2
                const expectedUser = testUsers.filter(user => user.id === id)
                
                return supertest(app)
                    .get(`/api/users/${id}`)
                    .expect(200, expectedUser[0])
            })
          })
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

              beforeEach('empty quiz_me_flashcards', () => {
                  return db.raw('TRUNCATE quiz_me_flashcards RESTART IDENTITY CASCADE')
              })
              
              it('should respond with 200 and an empty array', () => {
                return supertest(app)
                    .get('/api/flashcards')
                    .set('session_token', token)
                    .expect(200, [])
              })
          })

          context('Given valid flashcards', () => {
              it('should respond with 200 and all flashcards associated with that user', () => {
                  const expectedFlashcards = testFlashcards.filter(card => card.username === username)
                  return supertest(app)
                      .get('/api/flashcards')
                      .set('session_token', token)
                      .expect(expectedFlashcards)
              })
          })
      })

      describe('POST /api/flashcards', () => {
          context('Given an xss attack script', () => {
            it('should sanitize the card', () => {
                const dirtyFlashcard = {
                    question: '<script>sketchyQuestion</script>',
                    answer: '<script>sketchyAnswer</script>',
                    username: 'Nreid3035'
                }

                const sanitizedFlashcard = {
                    "flashcard_id": 1,
                    "username": "Nreid3035",
                    "question": "&lt;script&gt;sketchyQuestion&lt;/script&gt;",
                    "answer": "&lt;script&gt;sketchyAnswer&lt;/script&gt;"
                }

                return supertest(app)
                    .post('/api/flashcards')
                    .set('session_token', token)
                    .send(dirtyFlashcard)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.eql(sanitizedFlashcard)
                    })

            })
        })


          context('Given a valid request', () => {
            it('should respond with 201 and the new quiz', () => {
                const newFlash = {
                    flashcard_id: 6,
                    username: 'Nreid3035',
                    question: 'WHats A QuesTiON??',
                    answer: 'yes'
                }

                return supertest(app)
                    .post('/api/flashcards')
                    .set('session_token', token)
                    .send(newFlash)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('flashcard_id')
                        expect(res.body.question).to.eql(newFlash.question)
                        expect(res.body.answer).to.eql(newFlash.answer)
                    })
                    .then(postRes => 
                        supertest(app)
                            .get(`/api/flashcards/${postRes.body.flashcard_id}`)
                            .set('session_token', token)
                            .expect(postRes.body)
                        )
            })
          })

      })

      describe('GET /api/flashcards/:flashId', () => {
          context('Given no flashcards', () => {
                
              beforeEach('remove all flashcards', () => {
                  return db.raw('TRUNCATE quiz_me_flashcards RESTART IDENTITY CASCADE')
              })

              it('should respond with 404 not found and an error message', () => {
                const id = 123456
                return supertest(app)
                    .get(`/api/flashcards/${id}`)
                    .set('session_token', token)
                    .expect(404, {
                        error: { message: 'Flashcard does not exist' }
                    })
              })
          })

          context('Given valid flashcards', () => {
            it('should respond with 200 and the appropriate flashcard', () => {
              const id = 2
              const expectedFlashcard = testFlashcards.filter(card => card.flashcard_id === id)

              return supertest(app)
                  .get(`/api/flashcards/${id}`)
                  .set('session_token', token)
                  .expect(200, expectedFlashcard[0])
            })
          })
      })

      describe('DELETE /api/flashcards/:flashId', () => {
          context('Given no flashcards', () => {
  
              beforeEach('remove flashcards from quiz_me_flashcards', () => {
                  return db.raw('TRUNCATE quiz_me_flashcards RESTART IDENTITY CASCADE')
              })

              it('should respond with 404 not found and an error message', () => {
                const id = 123456
                return supertest(app)
                    .delete(`/api/flashcards/${id}`)
                    .set('session_token', token)
                    .expect(404, {
                        error: { message: 'Flashcard does not exist' }
                    })
              })
          })

          context('Given valid flashcards', () => {
              it('should respond with 204', () => {
                const idToDelete = 2
                const expectedCards = testFlashcards.filter(card => card.flashcard_id !== idToDelete && card.username === username)

                return supertest(app)
                    .delete(`/api/flashcards/${idToDelete}`)
                    .set('session_token', token)
                    .expect(204)
                    .then(() => 
                        supertest(app)
                            .get('/api/flashcards')
                            .set('session_token', token)
                            .expect(expectedCards)
                        )
              })
          })
      })   
  })

      describe('quiz_me_quizzes endpoints', () => {
          describe('GET /api/quizzes', () => {
              context('Given no quiz data', () => {

                beforeEach('remove quiz_me_quizzes content', () => {
                    return db.raw('TRUNCATE quiz_me_quizzes RESTART IDENTITY CASCADE')
                }) 

                  it('should respond with 200 and an empty array', () => {
                    return supertest(app)
                        .get('/api/quizzes')
                        .set('session_token', token)
                        .expect(200, [])
                  })
              })

              context('Given valid quiz data', () => {
                  const expectedQuizzes = testQuizzes.filter(quiz => quiz.username === username)
                  it('should respond with 200 and the corresponding array of quizzes for the user', () => {
                    return supertest(app)
                        .get('/api/quizzes')
                        .set('session_token', token)
                        .expect(expectedQuizzes) 
                  })
              })
          })

          describe('POST /api/quizzes', () => {
              context('Given an xss attack script', () => {
                  it('should sanitize the quiz', () => {
                    const dirtyQuiz = {
                        quiz_name: "<script>dirtyname</script>",
                        username: username,
                        flashcardIds: [2]
                    }

                    const sanitizedQuiz = {
                        quiz_name: "&lt;script&gt;dirtyname&lt;/script&gt;",
                    }

                    return supertest(app)
                        .post('/api/quizzes')
                        .set('session_token', token)
                        .send(dirtyQuiz)
                        .expect(201)
                        .expect(res => {
                            expect(res.body.quiz_name).to.eql(sanitizedQuiz.quiz_name)
                        })
                  })
              })

              context('Given a valid request', () => {
                  it('should respond with 201 and the created quiz', () => {
                    const newQuiz = {
                        flashcardIds: [2, 4],
                        username: username,
                        quiz_name: 'Dev Quiz',
                    }

                    const responseQuiz = [
                        {
                          question: 'HTML?',
                          answer: 'Hypertext Markup Language',
                          quiz_name: 'Dev Quiz',
                          flashcard_id: 2
                        },
                        {
                          question: 'Who won the 2009 World Series?',
                          answer: 'New York Yankees',
                          quiz_name: 'Dev Quiz',
                          flashcard_id: 4
                        }
                      ]

                    return supertest(app)
                        .post('/api/quizzes')
                        .set('session_token', token)
                        .send(newQuiz)
                        .expect(201)
                        .expect(res => {
                            expect(res.body).to.have.property('prime_quiz_id')
                            expect(res.body.quiz_name).to.eql(newQuiz.quiz_name)
                            expect(res.body.username).to.eql(newQuiz.username)
                        })
                        .then(postRes =>
                            supertest(app)
                                .get(`/api/quizzes/${postRes.body.prime_quiz_id}`)
                                .set('session_token', token)
                                .expect(responseQuiz)
                            )
                  })
              })
          })

          describe('GET /api/quizzes/:quizId', () => {
              context('Given no quizzes', () => {

                beforeEach('remove quizzes from table', () => {
                    return db.raw('TRUNCATE quiz_me_quizzes, quiz_flash_sets, quiz_me_flashcards RESTART IDENTITY CASCADE;')
                })

                  it('should respond with 404 not found and an error message', () => {
                    const id = 123456
                    return supertest(app)
                        .get(`/api/quizzes/${id}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Quiz does not exist' }
                        })
                        .then(res => console.log(res))
                  })
              })

              context('Given valid quiz data', () => {
                  it('should respond with 200 and the corresponding quiz', () => {
                    const id = 2
                    const expectedQuiz = testQuizzes.filter(quiz => quiz.prime_quiz_id === id)
                    const expectedResponse = [{
                        question: 'HTML?',
                        answer: 'Hypertext Markup Language',
                        quiz_name: 'Dev Quiz',
                        flashcard_id: 2
                      },
                      {
                        question: 'Who won the 2009 World Series?',
                        answer: 'New York Yankees',
                        quiz_name: 'Dev Quiz',
                        flashcard_id: 4
                      }
                    ]

                    return supertest(app)
                        .get(`/api/quizzes/${id}`)
                        .set('session_token', token)
                        .expect(200, expectedResponse)
                  })
              })
          })

          describe('DELETE /api/quizzes/quizId', () => {
              context('Given no quiz data', () => {
                  beforeEach('remove quizzes from table', () => {
                      return db.raw('TRUNCATE quiz_me_quizzes, quiz_flash_sets, quiz_me_flashcards RESTART IDENTITY CASCADE;')
                  })
                  it('should respond with 404 not found and an error message', () => {
                    const id = 123456
                    return supertest(app)
                        .delete(`/api/quizzes/${id}`)
                        .set('session_token', token)
                        .expect(404, {
                            error: { message: 'Quiz does not exist' }
                        })
                  })
              })

              context('Given a valid dataset of quizzes', () => {
                  it('should respond with 204', () => {
                    const idToDelete = 2
                    const expectedQuizzes = testQuizzes.filter(quiz => quiz.id !== idToDelete)

                    return supertest(app)
                        .delete(`/api/quizzes/${idToDelete}`)
                        .set('session_token', token)
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