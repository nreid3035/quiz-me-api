const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')


// FUNCTION TO VALIDATE THE JSON WEB TOKEN 
validateToken = (req, res, next) => {
    // EXTRACT TOKEN FROM THE REQUEST HEADERS
    const { session_token } = req.headers
    // USE VERIFY FUNCTION TO MATCH JSON WEB TOKEN, IF NO ERRORS ASSIGN DECODED INFO TO AN OBJECT AVAILABLE IN THE REQUEST OBJECT
    jwt.verify(session_token, JWT_SECRET, (err, tokenDecoded) => {
        // IF THERES AN ERROR RESPOND WITH 401 AND 'NOT AUTHORIZED'
        if(err) {
            res.status(401).json({
                error: { message: 'Not authorized' }
            })
        } else {
            req.userInfo = tokenDecoded
            next()
        }
    })
}

module.exports = {
    validateToken
}
