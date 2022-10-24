require('dotenv').config()
const xlsx = require('xlsx')

const {authenticateToken} = require('../middleware/authMiddleware')

const logger = require('../helpers/logger')

const db = require('../db')

const io = global.io

const { Router } = require('express')
const router = new Router()
module.exports = router

const fileSystem = require('fs')
fileSystem.stat('excelFiles/uploaded/check.txt', function(err){
    if(err == null){
        console.log('✅ SUCCESS: Excel File uploaded dir exists')
    }
    else{
        console.log('❌ ERROR: Excel File uploaded dir does not exists')
    }
})

fileSystem.stat('excelFiles/solved/check.txt', function(err){
    if(err == null){
        console.log('✅ SUCCESS: Excel File solved dir exists')
    }
    else{
        console.log('❌ ERROR: Excel File solved dir does not exists')
    }
})

//#region File Storage Code
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'excelFiles/uploaded')
    }, 
    filename: async function(req, file, cb){
        const {rows} = await db.query(`INSERT INTO public."Scenarios"(scenario_status, user_id, input_filename) VALUES($1, $2, $3) RETURNING id`, [0, req.user_id, file.originalname])
        const fileName = rows[0].id + ".xlsx"
        cb(null, fileName)
        req.fileName = fileName
        req.scenario_id = rows[0].id
    }
})
const upload = multer({storage: storage})
//#endregion

router.post("/uploadScenario", authenticateToken, upload.single('excelFile'), async function (req, res){
    const fileName = req.fileName
    const scenario_id = req.scenario_id
    
    try{
        const workBook = xlsx.readFile('excelFiles/uploaded/' + fileName)
        const worksheet = workBook.Sheets['Cover_Page']
        const scenario_code = worksheet['F22'].v
        const sku_grp_value = worksheet['F32'].v
        const demand_value = worksheet['F21'].v
        const demand = demand_value.slice(0, demand_value.length - 1)
        var sku_type = ""
        if(sku_grp_value == "Yes"){
            sku_type = "grp"
        }
        else if(sku_grp_value == "No"){
            sku_type = "sku"
        }
        else{
            return res.status(400).send('Incorrect excel file template: Cannot read cover_page values')
        }
        await db.query('UPDATE public."Scenarios" SET scenario_code = $1, sku_type = $2, demand = $3 WHERE id = $4', [scenario_code, sku_type, demand, scenario_id])
        logger.info(`Successful upload Scenario #${scenario_id}: User #${req.user_id}`)
        return res.redirect('/')
    }
    catch(err){
        await db.query('DELETE FROM public."Scenarios" WHERE id = $1', [scenario_id])
        return res.status(400).send('Incorrect excel file template: Cannot read cover_page values')
    }
})

router.delete('/deleteScenario/:id', authenticateToken, async function(req, res){
    // Can the user delete the file
    const user_id = req.user_id
    const role_id = req.role_id
    const scenario_id = req.params['id']

    try{
        if(role_id != 1 && role_id != 2){
            const {rows} = await db.query('SELECT user_id from public."Scenarios" WHERE id = $1', [scenario_id])
            if(rows.length === 0){
                logger.error(`Delete scenario #${scenario_id}: Cannot find scenario in DB`)
                return res.status(400).send(`Cannot find scenario #${scenario_id} in DB`)
            }
            else if(rows[0].user_id != user_id){
                logger.warn(`Delete scenario #${scenario_id}: User #${user_id} attempted to delete scenario`)
                return res.status(401).send(`Not allowed to delete this scenario`)
            }
        }
        // Passed all checks can now delete scenario from all tables
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
    
        const fileName = scenario_id + ".xlsx"
        const logName = scenario_id + ".txt"
        fileSystem.unlink('excelFiles/uploaded/' + fileName, function(err){})
        fileSystem.unlink('excelFiles/solved/' + fileName, function(err){})
        fileSystem.unlink('excelFiles/logs/' + logName, function(err){})
        logger.info(`Successfully deleted scenario #${scenario_id}: User #${user_id}`)
        io.sockets.emit('updateScenarios')
        return res.json({success:true})
    }
    catch(err){
        logger.error(`Deleting scenario #${scenario_id}: ${err}`)
    }
    
})

router.get('/downloadInput/:id', authenticateToken, async function(req, res){
    //Is the user allowed to download this file
    //Admin and Super user
    const role_id = req.role_id
    const file_id = req.params['id']
    const user_id = req.user_id
    const filePath = "excelFiles/uploaded/" + file_id + ".xlsx"

    try{
        const {rows} = await db.query('SELECT input_filename FROM public."Scenarios" WHERE id = $1', [file_id])
        if(rows.length == 0){
            logger.error(`Download input file: Scenario #${file_id} not found in DB`)
            return res.status(500).send('Cannot find scenario in DB')
        }
        const fileName = rows[0].input_filename

        if(role_id != 1 && role_id != 2){
            const {rows} = await db.query(`SELECT user_id FROM public."Scenarios" WHERE id = $1`, [file_id])
            if(rows[0].user_id != user_id){
                logger.warn(`Downloading input file: User #${user_id} attempted to download input file #${file_id} not belonging to them`)
                return res.status(401).send("Not allowed to download file not belonging to a different user")
            }  
        }
        res.download(filePath, fileName, function(err){
            if(err){
                logger.error(`Res.download in download input for scenario #${file_id}: ${err}`)
            }
            else{
                logger.info(`Success download input file #${file_id}: User#${user_id}`)
            }
        })
    }
    catch(err){
        logger.error(`User #${user_id} downloading input file for scenario #${file_id}": ${err}`)
    }
    
    
})

router.get('/downloadSolved/:id', authenticateToken, async function(req, res){
    // Is the user allowed to download this file
    //Admin and Super user
    const role_id = req.role_id
    const file_id = req.params['id']
    const user_id = req.user_id
    try{
        const {rows} = await db.query(`SELECT output_filename, user_id FROM public."Scenarios" WHERE id = $1`, [file_id])
        if(rows.length === 0){
            logger.error(`Download solved file: Scenario #${file_id} not found in DB`)
            return res.status(500).send(`Cannot find scenario in DB`)
        }

        if(role_id != 1 && role_id != 2){
            if(rows[0].user_id != user_id){
                logger.warn(`Downloading solved file: User #${user_id} attempted to download input file #${file_id} not belonging to them`)
                return res.status(401).send("Not allowed to download another User's solved file")
            }  
        }
        const output_filename = rows[0].output_filename
        const filePath = "excelFiles/solved/" + file_id + ".xlsx"
        res.download(filePath, output_filename, function(err){
            if(err){
                logger.error(`Res.download in download solved for scenario #${file_id}: ${err}`)
            }
            else{
                logger.info(`Success download solved file #${file_id}: User# ${user_id}`)
            }
        })
    }
    catch(err){
        logger.error(`User #${user_id} download solved file #${file_id}: ${err}`)
    }
    
})

router.get('/downloadTemplate', authenticateToken, async function(req, res){
    res.download('excelFiles/template/BGOInputFile.xlsx', function(err){
        if(err){
            logger.error(`Res.download in download template: ${err}`)
        }
        else{
            logger.info(`Success download template excel file: User #${req.user_id}`)
        }
    })
})

router.get('/downloadLog/:id', authenticateToken, async function(req, res){
    const file_id = req.params['id']
    const role_id = req.role_id
    const user_id = req.user_id

    try{
        if(role_id != 1 && role_id != 2){
            const {rows} = await db.query(`SELECT user_id FROM public."Scenarios" WHERE id = $1`, [file_id])
            if(rows[0].user_id != user_id){
                logger.warn(`Downloading log file: User #${user_id} attempted to download log file #${file_id} not belonging to them`)
                return res.status(401).send("Not allowed to download log file belonging to another user")
            }  
        }
        res.download(`excelFiles/logs/${file_id}.txt`, `log_${file_id}.txt`, function(err){
            if(err){
                logger.error(`Res.download in download log file for scenario #${file_id}: ${err}`)
            }
            else{
                logger.info(`Success download log file for scenario #${file_id}: User #${req.user_id}`)
            }
        })
    }
    catch(err){
        logger.error(`User #${user_id} downloading input file for scenario #${file_id}" ${err}`)
    }
})