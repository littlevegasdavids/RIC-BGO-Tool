const jwt = require('jsonwebtoken')

const db = require('../db/index')

function authenticateToken(req, res, next){
    const authcookie = req.cookies.authcookie

    jwt.verify(authcookie, process.env.TOKEN_SECRETE, async function(err, data){
        if(err){
            res.clearCookie('authcookie')
            return res.redirect('/')
        }
        
        const {rows} = await db.query('SELECT id, role_id FROM public."Users" WHERE id = $1', [data.user_id])

        if(rows.length == 0){
            res.clearCookie('authcookie')
            return res.redirect('/')
        }

        if(rows[0].id != data.user_id || rows[0].role_id != data.role_id){
            res.clearCookie('authcookie')
            return res.redirect('/')
        }

        req.user_id = data.user_id;
        req.role_id = data.role_id
        next()
    })
}

function authenticateTokenAdmin(req, res, next){
    const authcookie = req.cookies.authcookie

    jwt.verify(authcookie, process.env.TOKEN_SECRETE, async function(err, data){
        if(err){
            res.clearCookie('authcookie')
            return res.redirect('/')
        }

        const {rows} = await db.query('SELECT id, role_id FROM public."Users" WHERE id = $1', [data.user_id])
        
        if(rows.length == 0){
            res.clearCookie('authcookie')
            return res.redirect('/')
        }

        if(rows[0].id != data.user_id || rows[0].role_id != data.role_id){
            res.clearCookie('authcookie')
            return res.redirect('/')
        }

        if(data.role_id != 1){
            return res.redirect('/')
        }

        req.user_id = data.user_id;
        req.role_id = data.role_id
        next()
    })
}

module.exports = {authenticateToken, authenticateTokenAdmin}