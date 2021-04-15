# Quiz Me API

## Description

Server side code for the Quiz Me app, Quiz Me is an application that allows users to make their own flashcards and group them together into quizzes to be taken at anytime. Use cases range from students looking for quick and convienient ways to study during downtime, to an executive who wants to refresh themselves on talking points before a big meeting during their commute. Continue reading to understand how the API for this application works and how you can import it to your local machine to use as well.

## Usage

The Quiz Me API utilizes JSON Web Token authentication for it's signup and login process. Passwords are hashed as part of general security using bcrypt.

The JSON Web Token will be generated on a successful login and has a set expiration time of 60 minutes. The token will be stored locally and passed along with most of your requests from the client to the server.

The API utilizes express router to make 3 primary routes:
 - /api/users
 - /api/flashcards
 - /api/quizzes

### /api/users

The /api/users endpoint can accomplish these requests

 - GET /api/users will return all users within the database
 - POST /api/signup is what is used to submit a user to the database *
 - GET /api/users/username-lookup will get a specific user by username
 - GET /api/users/:userId will get a specific user by their generated id
 - DELETE /api/users/:userId will delete a user from the database by looking up it's ID


### /api/flashcards

The /api/flashcards endpoint can accomplish these requests

 - GET /api/flashcards will return all flashcards associated with the logged in user, Uses jwt to access username
 - POST /api/flashcards will add a flashcard to the database available to only the user who made it
 - GET /api/flashcards/:flashId will get a specific flashcard based on the flashcard_id of that card
 - DELETE /api/flashcards:flashId will remove a card from the database based on the flashcard_id passed by the params object


 ### /api/quizzes

 The /api/quizzes endpoint can accomplish these requests

 - GET /api/quizzes will return all quizzes associated with the user logged in, using jwt to access this info.
 - POST /api/quizzes will submit a new quiz to the quiz_me_quizzes table, containing the name, the username and a generated id(prime_quiz_id), the request will contain the ids of the flashcards for that quiz. These ids will be paired with the generated quiz id and assigned to another table named quiz_flash_sets.
 - GET /api/quizzes/:quizId will return the associated quiz and its information (including name, and id), as well as an array containing the questions of that quiz. It will do this through a join based on the quiz_flash_sets table.
 - DELETE /api/quizzes/:quizId will remove a quiz from the database based on the prime_quiz_id and in turn will remove any sets from quiz_flash_sets that use that id as well.

 ## Languages, Frameworks, Libraries, etc.

 - JavaScript
 - NodeJs
 - Express
 - PostgreSQL
 - Knex
 - XSS
 - bcrypt
 - JSON Web Token
 - Helmet
 - Morgan
 - Cors 
 - pg
 - chai
 - mocha
 - nodemon
 - supertest

 ## Development

 To use on your local computer fork the project and copy the clone code then use git bash (or your prefered method)

```bash 
git clone (repo link here)
```

Make sure that the CLIENT_ORIGIN variable in the config.js file will be equal to where you plan to run the client side from.

Use npm test to check that all tests are passing 

```bash
npm test
```

Use the 'npm run dev' script to run the server with nodemon, which will update your changed as soon as you save your work

```bash
npm run dev
```

## License

MIT License

Copyright (c) [2021] [Nicholas Reid]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.