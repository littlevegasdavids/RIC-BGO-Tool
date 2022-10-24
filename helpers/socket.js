const db = require("../db")

module.exports = (io) =>{
    io.on('connect', socket =>{
        socket.on('getScenarios', async (userInfo)=>{
            const user_id = userInfo.user_id
            const role_id = userInfo.role_id
            
            const ready = []
            const solved = []
            const busy = []
            const error = []
            const queue = []

            if(role_id == 3){
                const {rows} = await db.query('SELECT * FROM public."Scenarios" WHERE user_id = $1', [user_id])
                rows.forEach((row) => {
                    switch (row.scenario_status){
                        //Ready
                        case 0:
                            ready.push(row)
                        break;
    
                        //Busy
                        case 1:
                            busy.push(row)
                        break;
                        
                        //Busy
                        case 2:
                            busy.push(row)
                        break;
    
                        //Busy
                        case 3:
                            busy.push(row)
                        break;
    
                        //Solved
                        case 4:
                            solved.push(row)
                        break;
    
                        //Error
                        case 5:
                            error.push(row)
                        break;
    
                        //Queue
                        case 6:
                            queue.push(row)
                        break;
                    }
                })
                socket.emit('receiveScenarios', {
                    message: 'Success', 
                    ready: ready, 
                    solved: solved, 
                    busy: busy, 
                    error: error, 
                    queue: queue
                })
            }
            else if(role_id == 1 || role_id == 2){
                const {rows} = await db.query('SELECT * FROM public."Scenarios"')
                rows.forEach((row) => {
                    switch (row.scenario_status){
                        //Ready
                        case 0:
                            ready.push(row)
                        break;
    
                        //Busy
                        case 1:
                            busy.push(row)
                        break;
                        
                        //Busy
                        case 2:
                            busy.push(row)
                        break;
    
                        //Busy
                        case 3:
                            busy.push(row)
                        break;
    
                        //Solved
                        case 4:
                            solved.push(row)
                        break;
    
                        //Error
                        case 5:
                            error.push(row)
                        break;
    
                        //Queue
                        case 6:
                            queue.push(row)
                        break;
                    }
                })
                socket.emit('receiveScenarios', {
                    message: 'Success', 
                    ready: ready, 
                    solved: solved, 
                    busy: busy, 
                    error: error, 
                    queue: queue
                })
            }
            
        })
    })
}