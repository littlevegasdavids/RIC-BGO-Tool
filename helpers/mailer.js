

require('dotenv').config()
const nodemailer = require('nodemailer')
const {google} = require('googleapis')

const logger = require('./logger')

const db = require('../db/index')

const client_id = process.env.EMAIL_CLIENT_ID
const client_secret = process.env.EMAIL_CLIENT_SECRET
const redirect_uri = process.env.EMAIL_REDIRECT_URI
const refresh_token = process.env.EMAIL_REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri)
oAuth2Client.setCredentials({refresh_token: refresh_token})

const accessToken = oAuth2Client.getAccessToken()

const transport = nodemailer.createTransport({
    service: 'gmail', 
    auth:{
        type: 'OAuth2', 
        user: 'ricgroup@ricgroup.net',
        clientId: client_id, 
        clientSecret: client_secret,
        refreshToken: refresh_token, 
        accessToken: accessToken
    }
})

const endMessage = `\n\n..............................................\nThis is an Automated Email Service by RIC BGO\n..............................................`

async function sendSuccessEmail(scenario_id, email){
    const user_name = await getUserName(email)
    const message = `Dear ${user_name}\nScenario #${scenario_id} has successfully been solved by the BGO Tool.${endMessage}`
    try{
        const mailOptions = {
            from: 'RIC BGO Tool <ricgroup@ricgroup.net>', 
            to: email, 
            subject: `BGO TOOL: Scenario #${scenario_id} Success`, 
            text: message
        }
        await transport.sendMail(mailOptions)
    }
    catch(err){
        logger.error(`Something went wrong in sendSuccessEmail: ${err}`)
    }
    
}

async function sendErrorMail(scenario_id, email, error){
    const user_name = await getUserName(email)
    const message = `Dear ${user_name}\nScenario #${scenario_id} has encountered an error through the BGO Tool.\nError:${error}${endMessage}`
    try{    
        const mailOptions = {
            from: 'RIC BGO Tool <ricgroup@ricgroup.net>', 
            to: email, 
            subject: `BGO TOOL: Scenario #${scenario_id} Error`, 
            text: message
        }
        await transport.sendMail(mailOptions)

    }
    catch(err){
        logger.error(`Something went wrong in sendErrorMail: ${err}`)
    }
    
}

async function sendUserKillMail(scenario_id, email){
    const user_name = await getUserName(email)
    const message = `Dear ${user_name}\nScenario #${scenario_id} has been terminated by an authorized user.${endMessage}`
    try{
        const mailOptions = {
            from: 'RIC BGO Tool <ricgroup@ricgroup.net>', 
            to: email, 
            subject: `BGO TOOL: Scenario #${scenario_id} Terminated`, 
            text: message
        }
        await transport.sendMail(mailOptions)
    }
    catch(err){
        logger.error(`Something went wrong in sendUserKillMail: ${err}`)
    }
    
}

async function sendRegisterMail(email, name){
    const user_name = await getUserName(email)
    const message = `Dear ${user_name}.\nThis email serves as a successful registration with RIC BGO Tool. Please contact your admin to get your password. It is highly recommended to change your password upon successfully signing into the BGO Tool.${endMessage}`
    try{
        const mailOptions = {
            from: 'RIC BGO Tool <ricgroup@ricgroup.net>', 
            to: email, 
            subject: `BGO TOOL: Successfully registered`, 
            text: message
        }
        await transport.sendMail(mailOptions)
    }
    catch(err){
        logger.error(`Something went wrong in sendRegisterEmail: ${err}`)
    }
}

async function sendAdminChangePassword(email){
    const user_name = await getUserName(email)
    const message = `Dear ${user_name}.\nThis email serves as a notification of an admin changing your password. If you did not request this to an authorized admin please contact RIC immediately.${endMessage}`
    try{
        const mailOptions = {
            from: 'RIC BGO Tool <ricgroup@ricgroup.net>', 
            to: email, 
            subject: `BGO TOOL: Changed password`, 
            text: message
            
        }
        await transport.sendMail(mailOptions)
    }
    catch(err){
        logger.error(`Something went wrong trying to send admin change password email: ${err}`)
    }
}

async function sendChangePassword(email){
    const user_name = await getUserName(email)
    const message = `Dear ${user_name}.\nThis email serves as a notification of the changing of your password. If this was not done by you please contact an authorized admin or RIC immediately.${endMessage}`
    try{
        const mailOptions = {
            from: 'RIC BGO Tool <ricgroup@ricgroup.net>', 
            to: email, 
            subject: `BGO TOOL: Changed password`, 
            text: message
        }
        await transport.sendMail(mailOptions)
    }
    catch(err){
        logger.error(`Something went wrong trying to send change password email: ${err}`)
    }
}

async function getUserName(email){
    const {rows} = await db.query('SELECT name FROM public."Users" WHERE email = $1', [email])
    if(rows.length == 0){
        logger.error(`Email get user name: Cannot find name with email ${email} in DB`)
        return "NA"
    }
    else if(rows.length != 1){
        logger.warn(`Email get user name: Email ${email} exists more than once in the DB`)
    }
    return rows[0].name
}

module.exports = {sendSuccessEmail, sendErrorMail, sendUserKillMail, sendRegisterMail, sendAdminChangePassword, sendChangePassword}
