const jwt = require('jsonwebtoken')

validateToken = (req, res, next) => {
    const { session_token } = req.headers
    jwt.verify(session_token, 'secret', (err, tokenDecoded) => {
        if(err) {
            res.status(401).json({
                error: { message: 'Not authorized' }
            })
        } else {
            console.log(tokenDecoded)
            req.userInfo = tokenDecoded
            next()
        }
    })
}

module.exports = {
    validateToken
}
