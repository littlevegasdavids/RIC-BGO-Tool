const { Router } = require('express')
const router = new Router()
const { authenticateToken } = require('../middleware/authMiddleware');
const {sendSuccessEmail, sendErrorMail, sendUserKillMail} = require('../helpers/mailer')

const logger = require('../helpers/logger')

const fileSystem = require('fs');
const db = require('../db');
const { setTimeout } = require('timers');
//const pythonFileName = "Solver_Simulate.py"
const pythonFileName = "Solver.py"
const pySpawn = require('child_process').spawn;
var py;
let io = global.io


fileSystem.stat(pythonFileName, function(err){
    if(err == null){
        console.log('✅ SUCCESS: Solver python file in dir: ' + pythonFileName)
    }
    else{
        console.log('❌ ERROR: Solver python file does not exists: ' + pythonFileName)
    }
})

module.exports = router

router.post('/sendToQueue/:id', authenticateToken, async function(req, res){
    const fileId = req.params['id']
    const role_id = req.role_id
    const user_id = req.user_id

    try{
        //Check that the file exists and is in the DB
        fileSystem.stat(`excelFiles/uploaded/${fileId}.xlsx`, function(err){
            if(err){
                logger.error(`Send to queue scenario: Cannot find excelFiles/uploaded/${fileId}.xlsx`)
                return res.status(500).send('Cannot find file')
            }
        })
        const {rows} = await db.query('SELECT * FROM public."Scenarios" WHERE id = $1', [fileId])
        if(rows.length == 0){
            logger.error(`Send to queue Scenario #${fileId}: Not found in DB`)
            return res.status(500).send('Unable to find scenario in DB')
        }
        if(role_id != 1 && role_id != 2){
            if(rows[0].user_id != user_id){
                logger.warn(`Send to queue Scenario #${fileId}: User #${user_id} tried to send scenario to queue when not allowed to`)
                return res.status(400).send("Not allowed to send another user's scenario to queue")
            }
        }
        const scenario_id = rows[0].id
        await db.query('UPDATE public."Scenarios" SET scenario_status = $1 WHERE id = $2', [6, scenario_id])

        logger.info(`Scenario #${scenario_id} has been added to the queue: User #${user_id}`)
        return res.status(200).json({success: true})
    }
    catch(err){
        logger.error(`Send to queue scenario #${fileId}: ${err}`)
        return res.status(500).json({success: false})
    }
    
})

// Only one scenario can be solved at a time  
router.delete('/killSolver/:id', authenticateToken, async function(req, res){
    const fileId = req.params['id']
    const user_id = req.user_id
    try{
        // Can this scenario be killed by the user
        if(req.role_id != 1 && req.role_id != 2){
            const {rows} = await db.query('SELECT user_id FROM public."Scenarios" WHERE id = $1', [fileId])
            if(rows.length == 0){
                logger.error(`Kill solver scenario #${fileId}: Cannot find scenario in DB`)
                return res.status(500).send("Cannot find scenario in DB")
            }
            if(rows[0].user_id != req.user_id){
                logger.warn(`Kill scenario #${fileId}: User #${user_id} tried to kill scenario when not allowed to`)
                return res.status(401).json({success: false, message: "Not allowed to kill the current scenario"})
            }
        }
        await db.query('UPDATE public."Scenarios" SET scenario_status = $1, error_message = $2 WHERE id = $3', [5, "Killed by user", fileId])
        py.kill('SIGINT')
        logger.info(`Success killed scenario #${fileId}: User #${user_id}`)
        return res.status(200).json({success: true})
    }
    catch(err){
        logger.error(`Kill solver scenario #${fileId} User #${user_id}: ${err}`)
        return res.status(500).json({success: false})
    }
    
})

router.post('/dequeueSolver/:id', authenticateToken, async function(req, res){
    const fileId = req.params['id']
    const user_id = req.user_id
    try{
        if(req.role_id != 1 && req.role_id != 2){
            const {rows} = await db.query('SELECT user_id FROM public."Scenarios" WHERE id = $1', [fileId])
            if(rows.length == 0){
                logger.error(`Dequeue scenario #${fileId}: Cannot find scenario in DB`)
                return res.status(500).json({success: true, message: "Cannot find scenario in DB"})
            }
            if(rows[0].user_id != req.user_id){
                logger.warn(`Dequeue scenario #${fileId}: User #${user_id} tried to dequeue scenario when not allowed to`)
                return res.status(401).send("Not allowed to dequeue another user's scenario")
            }
        }
        await db.query('UPDATE public."Scenarios" SET scenario_status = $1 WHERE id = $2', [0, fileId])
        logger.info(`Success dequeue scenario #${fileId}: User #${user_id}`)
        return res.status(200).json({success: true})
    }
    catch(err){
        logger.error(`Dequeue scenario #${fileId} User #${user_id}: ${err}`)
    }
    
})

var solveScenario = async function(scenario_id, user_email, callback){
    try{
        //Creating log file
        let writeStream = fileSystem.createWriteStream(`excelFiles/logs/${scenario_id}.txt`)
        writeStream.write(`### Scenario id: ${scenario_id} ###\n`)

        py = pySpawn('python3', ["-u", pythonFileName, scenario_id])
        await db.query('UPDATE public."Scenarios" SET scenario_status = $1 WHERE id = $2', [1, scenario_id])
        logger.info(`Solver running on scenario #${scenario_id}`)

        results = ""
        error = ""
        let errorEncountered = false
        py.stdout.on('data', (data)=>{
            let solverData = String(data)
            writeStream.write(solverData)
            io.sockets.emit('solverFeedback', solverData)
            results += solverData
        })

        py.stderr.on('data', async (data)=>{
            errorEncountered = true
            error = String(data)
        })

        py.on('exit', async function(code){
            //Was the error caused by the end user killing the scenario ?
            //The only time scenario status is an error before catching error in python file is when the user has killed the solver
            const {rows} = await db.query('SELECT scenario_status, error_message FROM public."Scenarios" WHERE id = $1', [scenario_id])
            if(rows[0].scenario_status == 5 && rows[0].error_message == "Killed by user"){
                await sendUserKillMail(scenario_id, user_email)
                writeStream.write('Killed by user')
            }
            
            if(rows[0].scenario_status == 5 && rows[0].error_message == "Solution infeasible"){
                error = "Solution infeasible"
                errorEncountered = true
            }

            if(!errorEncountered){
                logger.info(`Solver success scenario #${scenario_id}`)
                await sendSuccessEmail(scenario_id, user_email)
            }
            else{
                logger.error(`Solver error scenario #${scenario_id}: ${error}`)
                await db.query('UPDATE public."Scenarios" SET error_message = $1, scenario_status = $2 WHERE id = $3', [error, 5,scenario_id])
                await sendErrorMail(scenario_id, user_email, error)
                writeStream.write(error)
            }
            writeStream.end()
            callback()
        })
    }
    catch(err){
        logger.error(`Solve scenario #${scenario_id}: ${err}`)
    }
    
}

// Every 5 seconds it will check if their is an item in the queue.
// If their is any item in the queue then it will take the first one 
// Should not remove it from the queue because the solveScenario function will do that


setInterval(async ()=>{
    const {rows} = await db.query('SELECT id, user_id FROM public."Scenarios" WHERE scenario_status = $1', [6])

    const is_busy_query = await db.query('SELECT is_busy FROM public."Solver_Busy" WHERE id = 1')
    let solverBusy = is_busy_query.rows[0].is_busy

    if(rows.length > 0 && !solverBusy){
        if(!solverBusy){
            solverBusy = true
            // Takes the first in the queue
            const scenario_id = rows[0].id
            const user_id = rows[0].user_id

            const user_email = await getUserEmail(user_id)
            solveScenario(scenario_id, user_email, async ()=>{
                await db.query('UPDATE public."Solver_Busy" SET is_busy = false')
            })
        }
    }
}, 5000)


async function getUserEmail(user_id){
    const {rows} = await db.query('SELECT email FROM public."Users" WHERE id = $1', [user_id])
    return rows[0].email
}

