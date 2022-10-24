var validator = require('email-validator')
const Checker = require('password-checker')
const passChecker = new Checker()
passChecker.min_length = 8;
passChecker.requireLetters(true)
passChecker.requireNumbers(true)
passChecker.requireSymbols(false)

function checkEmail(email){
    return validator.validate(email)
}

function checkPassword(password){
    return passChecker.check(password)
}

module.exports = {checkEmail, checkPassword}