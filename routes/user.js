require('dotenv').config()
const { Router } = require('express')
const emailValidator = require('email-validator')
const bcrypt = require('bcrypt')
const saltRounds = 9;

const {checkPassword} = require('../helpers/checker')

const {sendChangePassword} = require('../helpers/mailer')

const db = require('../db')

const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../helpers/logger');

const router = new Router()
module.exports = router

router.post('/signIn', async(req, res)=>{
    try{
        const email = req.body.email
        const password = req.body.password
        
        // Is email valid
        if(!emailValidator.validate(email)){
            return res.status(200).json({success: false, message: "Invalid email format"})
        }

        const {rows} = await db.query(`SELECT id, email, password, role_id FROM public."Users" WHERE email = $1`, [email])
        
        // Does email exist
        if(rows.length === 0){
            return res.status(200).json({success: false, message: "Invalid credentials"})
        }
        
        bcrypt.compare(password, rows[0].password, function(err, result){
            if(err){
                logger.error(`Sign in hashing password: ${err}`)
                return res.status(500)
            }
            if(!result){
                return res.status(200).json({success: false, message: "Invalid credentials"})
            }
            const token = generateAccessToken(rows[0].id, rows[0].role_id)
            logger.info(`User #${rows[0].id} signed in`)
            res.cookie('authcookie', token, {maxage: 432000000})
            res.cookie('role_id', rows[0].role_id, {maxage: 432000000})
            return res.status(200).json({
                success: true,
                token: token
            }) 
        })
    }
    catch(err){
        logger.error(`Sign in: ${err}`)
        return res.redirect('/')
    }
})

router.get('/signOut', authenticateToken, (req, res)=>{
    logger.info(`User #${req.user_id} signed out`)
    res.clearCookie('authcookie')
    res.redirect('/')
})

router.get('/getUserInfo', authenticateToken, (req, res)=>{
    return res.status(200).json({
        user_id: req.user_id, 
        role_id: req.role_id
    })
})

router.post('/changePassword', authenticateToken, async(req, res)=>{
    const old_password = req.body.old_password
    const user_id = req.user_id
    try{
        //Checking if the old password is correct
        const {rows} = await db.query('SELECT password FROM public."Users" WHERE id = $1', [user_id])
        if(rows.length == 0){
            logger.error(`User #${user_id} change password: Cannot find user in db`)
            return res.status(400).send('Cannot find user in DB')
        }
        else{
            bcrypt.compare(old_password, rows[0].password, async function(err, result){
                if(err){
                    logger.error(`User #${user} change password compare hashing: ${err}`)
                    return res.status(500).json({success:false})
                }

                //Old password does not match
                if(!result)
                {
                    return res.status(200).json({success: false, message: 'Old password is incorrect'})
                }
                else{

                    const new_password = req.body.new_password
                    if(!checkPassword(new_password)){
                        return res.status(200).json({success: false, message: "Password does not pass requirements (i.e Length > 8, Letters & Numbers included)"})
                    }
                    else{
                        bcrypt.hash(new_password, saltRounds, async function(err, hash){
                            if(err){
                                logger.error(`User #${user} change password hashing: ${err}`)
                                return res.status(500).json({success:false})
                            }
                            const {rows} = await db.query(`UPDATE public."Users" SET password = $1 WHERE id = $2 RETURNING email`, [hash, user_id])
                            sendChangePassword(rows[0].email)
                            logger.info(`User #${user_id} has changed their password`)
                            return res.status(200).json({
                                success: true
                            })
                        })
                    }
                }
            })
        }
    }
    catch(err){
        logger.error(`User #${req.user_id} change password: ${err}`)
        return res.status(500).json({success: false})
    }
      
})

router.get('/getAllUserIds', authenticateToken, async(req, res)=>{
    try{
        const {rows} = await db.query('SELECT id, name FROM public."Users"')
        return res.status(200).json({success: true, user_ids: rows})
    }
    catch(err){
        logger.error(`Cannot get all user ids: ${err}`)
        return res.status(500).json({success: false})
    }
})

function generateAccessToken(id, role_id){
    return jwt.sign({user_id: id, role_id: role_id}, process.env.TOKEN_SECRETE,{expiresIn: 432000})
}

