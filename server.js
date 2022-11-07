require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT
const cookieParser = require('cookie-parser')
const io = require('socket.io')()

const logger = require('./helpers/logger')

const db = require('./db/index')

const {authenticateTokenAdmin, authenticateToken} = require('./middleware/authMiddleware')

app.use(express.static('public'))

const compression = require('compression')
app.use(compression())

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

var server = require('http').createServer(app).listen(port, function(){
    logger.info(`Server is now live on http://localhost:${port}`)
})
io.listen(server)
require('./helpers/socket')(io)
app.use(function(req, res, next){
    req.io = io;
    next()
})
global.io = io

const mountRoutes = require('./routes')

mountRoutes(app)

app.get('/adminPortal', authenticateTokenAdmin,(req, res)=>{
    res.sendFile(__dirname + "/public/index.html")
})

app.get('/createUser', authenticateTokenAdmin, (req, res)=>{
    res.sendFile(__dirname + "/public/index.html")
})

app.get('/changePassword', authenticateToken, (req, res)=>{
    res.sendFile(__dirname + "/public/index.html")
})

app.get('/changePasswordAdmin/:id', authenticateTokenAdmin, async (req, res)=>{
    const user_id = req.params["id"]
    const {rows} = await db.query('SELECT id FROM public."Users" WHERE id = $1', [user_id])
    if(rows.length == 0){
        return res.status(400).send(`User #${user_id} does not exist`)
    }

    return res.sendFile(__dirname + "/public/index.html")
})

app.get('/passwordReset', authenticateToken, (req, res)=>{
    res.sendFile(__dirname + "/public/index.html")
})