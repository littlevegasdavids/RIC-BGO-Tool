const {authenticateTokenAdmin} = require('../middleware/authMiddleware')
const db = require('../db')
const { Router } = require('express')

const logger = require('../helpers/logger')

const bcrypt = require('bcrypt')
const saltRounds = 9;

const {sendRegisterMail, sendAdminChangePassword} = require('../helpers/mailer')

const {checkEmail, checkPassword} = require('../helpers/checker')

const router = new Router()
module.exports = router

//#region File Storage Code
const fileSystem = require('fs')
fileSystem.stat('excelFiles/template/check.txt', function(err){
    if(err == null){
        console.log('✅ SUCCESS: Excel File template dir exists')
    }
    else{
        console.log('❌ ERROR: Excel File template dir does not exists')
    }
})

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        try{
            cb(null, 'excelFiles/template')
        }
        catch(err){
            logger.error('Multer storage: excelFiles/template dir does not exist')
        }
        
    }, 
    filename: async function(req, file, cb){
        try{
            await db.query('DELETE FROM public."TemplateFileInfo"')
            await db.query('INSERT INTO public."TemplateFileInfo"(file_name) VALUES($1)', [file.originalname])
            cb(null, "BGOInputFile.xlsx")
        }
        catch(err){
            logger.error(`Admin #${req.user_id} changing excel template file: ${err}`)
        }
        
    }
})
const upload = multer({storage: storage})
//#endregion


router.post('/uploadTemplate', authenticateTokenAdmin, upload.single('templateFile'), function (req, res){
    logger.info(`Changed template excel file: Admin #${req.user_id}`)
    return res.redirect('/adminPortal')
})

router.get('/getTemplateInfo', authenticateTokenAdmin, async (req, res)=>{
    try{
        const {rows} = await db.query('SELECT * FROM public."TemplateFileInfo"')
        return res.status(200).json(rows)
    }
    catch(err){
        logger.error(`Get template info: ${err}`)
        return res.status(500).send('Cannot get excel template info')
    }
})

router.delete('/deleteUser/:id', authenticateTokenAdmin, async(req, res)=>{
    const user_id = req.params['id']
    const admin_id = req.user_id
    try{
        const {rows} = await db.query('SELECT id FROM public."Users" WHERE id = $1', [user_id])
        if(rows.length == 0){
            logger.error(`Delete user #${user_id}: User does not exist in DB`)
            return res.status(400).send(`User #${user_id} does not exist`)
        }
        else{
            await deleteUserScenarios(user_id)
            const {rows} = await db.query('DELETE FROM public."Users" WHERE id = $1 RETURNING email', [user_id])
            const del_email = rows[0].email
            logger.info(`Success deleting user #${user_id} - ${del_email}: Admin #${admin_id}`)
            return res.status(200).json({success: true})
        }
    }
    catch(err){
        logger.error(`Admin #${req.user_id} deleting user #${user_id}: ${err}`)
        return res.status(500).send(`Cannot delete user #${user_id}`)
    }
})

router.post('/changeUserRole/:id/:new_role', authenticateTokenAdmin, async(req, res)=>{
    const user_id = req.params['id']
    const new_role = req.params['new_role']
    const admin_id = req.user_id
    try{
        if(new_role != 1 && new_role != 2 && new_role != 3){
            logger.error(`Change user #${user_id} role: role ${new_role} is invalid`)
            return res.status(400).message('Invalid role')
        }
        const {rows} = await db.query('SELECT id FROM public."Users" WHERE id = $1', [user_id])
        if(rows.length == 0){
            logger.error(`Change user #${user_id} role: Cannot find user in DB`)
            return res.status(400).send(`User #${user_id} does not exist therefore cannot change role`)
        }
        else{
            await db.query('UPDATE public."Users" SET role_id = $1 WHERE id = $2', [new_role, user_id])
            logger.info(`Changed role_id User #${user_id} to ${new_role}: Admin #${admin_id}`)
            return res.status(200).json({success: true})
        }
    }
    catch(err){
        logger.err(`Admin #${admin_id} changing user #${user_id} role: ${err}`)
        return res.status(500).send(`Cannot change User #${user_id} role`)
    }
})

router.post('/changePasswordAdmin/:id', authenticateTokenAdmin, async(req, res)=>{
    const user_id = req.params['id']
    const admin_id = req.user_id
    try{
        const new_password = req.body.new_password
        const {rows} = await db.query('SELECT id FROM public."Users" WHERE id = $1', [user_id])
        if(rows.length == 0){
            logger.error(`Admin change password: User #${user_id} does not exist in DB`)
            return res.status(400).send(`User #${user_id} does not exist`)
        }
        else{
            bcrypt.hash(new_password, saltRounds, async function(err, hash){
                if(err){
                    logger.error(`Admin change password hashing: ${err}`)
                    return res.status(500).json({success:false})
                }
                const {rows} = await db.query(`UPDATE public."Users" SET password = $1 WHERE id = $2 RETURNING email`, [hash, user_id])
                sendAdminChangePassword(rows[0].email)
                logger.info(`Admin changed password User #${user_id}: Admin #${admin_id}`)
                return res.status(200).json({
                    success: true
                })
            })
        }
    }
    catch(err){
        logger.error(`Admin #${admin_id} changing user #${user_id} password: ${err}`)
        return res.status(500).send(`Cannot change user #${user_id} password`)
    }

    
})

router.post('/createNewUser', authenticateTokenAdmin, async (req, res)=>{
    const admin_id = req.user_id
    try{
        const email = req.body.email
        const name = req.body.name
        const role_id = req.body.role_id
        const password = req.body.password

        // Is email valid
        if(!checkEmail(email)){
            return res.status(200).json({success: false, message: "Email invalid format"})
        }

        // Does email exists
        const {rows} = await db.query(`SELECT email FROM public."Users" WHERE email = $1`, [email])    
        if(rows.length != 0){
            return res.status(200).json({success: false, message: "Email already in use"})
        }

        // Is role_id valid
        if(!checkRoleId(role_id)){
            return res.status(200).json({success: false, message: "Role Id is invalid"})
        }

        // Is name valid: Check
        if(name.trim() === ""){
            return res.status(200).json({success: false, message: "Name cannot be empty"})
        }
        
        // Is password valid
        if(!checkPassword(password)){
            return res.status(200).json({success: false, message: "Password does not pass requirements (i.e Length > 8, Letters & Numbers included)"})
        }

        bcrypt.hash(password, saltRounds, async function(err, hash){
            if(err){
                logger.error(`Admin create user hashing password: ${err}`)
                return res.status(500).json({success:false})
            }
            const {rows} = await db.query(`INSERT INTO public."Users"(name, role_id, password, email) VALUES($1, $2, $3, $4) RETURNING id` , [name, role_id, hash, email])
            
            logger.info(`New User #${rows[0].id} role ${role_id}: Admin #${admin_id}`)
            sendRegisterMail(email, name)
            return res.status(200).json({
                success: true
            })
        })
    }catch(err){
        logger.error(`Admin #${admin_id} changing creating new user: ${err}`)
        return res.status(500).send('Cannot create new user')
    }

})

router.get('/getUsers', authenticateTokenAdmin, async (req, res)=>{
    try{
        const {rows} = await db.query('SELECT id, name, role_id, email FROM public."Users"')
        return res.status(200).json(rows)
    }catch(err){
        logger.error(`Admin portal getting user list: ${err}`)
        return res.status(500).send('Cannot get list of users')
    }
    
})

function checkRoleId(role_id){
    if(role_id < 0) return false
    if(role_id > 3) return false
    return true
}

async function deleteUserScenarios(user_id){
    const {rows} = await db.query('SELECT id FROM public."Scenarios" WHERE user_id = $1', [user_id])
    if(rows.length != 0){
        for(let i = 0; i < rows.length; i++){
            let scenario_id = rows[i].id
            await db.query('DELETE FROM public."FGSQ" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."FG_Cm" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."PdS_Pd" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."PdStQ" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."Pd_Pk" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."PkLnQ" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."PkS_Pk" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."Pk_FG" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."Pk_WIP" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."WIPSQ" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."WIP_rPK" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."rPkLnQ" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."rPkS_rPk" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."rPk_FG" WHERE scenario_id = $1', [scenario_id])
            await db.query('DELETE FROM public."Scenarios" WHERE id = $1', [scenario_id])
        }
    }
    
}