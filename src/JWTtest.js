const jwt = require('jsonwebtoken')

const privateKey = 'secretstring'
const payload = {foo: 'bar'}

jwt.sign(payload,privateKey, function (err,token) {
    if (err) console.log(err)
    if (token) console.log(token)
})