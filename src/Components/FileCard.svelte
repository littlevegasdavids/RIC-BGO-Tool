<script>
    import {onDestroy, onMount} from 'svelte'
    import {show_delete_scenario_popup} from '../Stores/delete_scenario_popup'
    import {show_kill_solver_popup} from '../Stores/kill_solver_popup'
    import {show_send_to_queue_popup} from '../Stores/send_to_queue_popup'

    export let fileId;
    export let fileName;
    export let uploadedDateTime;
    export let disableSolver;
    export let solvedDateTime;
    export let status;
    export let errorMessage;
    export let scenarioCode;
    export let cardColour;
    export let demand

    //let powerBiLink = `https://app.powerbi.com/reportEmbed?reportId=5bba8231-c260-4d40-806a-f7fccf133b2d&autoAuth=true&ctid=de4c8c22-e1fb-4d07-917a-e26a48e1c26b&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXdlc3QtZXVyb3BlLWItcHJpbWFyeS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldC8ifQ%3D%3D&filter=public_x0020_Scenarios/id%20eq%20${fileId}`

    //let powerBiLink = `https://app.powerbi.com/view?r=eyJrIjoiZDg4ZGQ0ZTYtNmExMi00ZmI4LWFiYWMtY2YwZjNkZDVjMTM0IiwidCI6ImRlNGM4YzIyLWUxZmItNGQwNy05MTdhLWUyNmE0OGUxYzI2YiIsImMiOjl9&pageName=ReportSection&filter=public Scenarios/id eq #ID`

    let powerBiLink = `https://app.powerbi.com/view?r=eyJrIjoiYjQwODkyNjUtZDFlYy00MDMxLWE3MTQtMGU2MGI4ODkwYjNkIiwidCI6ImRlNGM4YzIyLWUxZmItNGQwNy05MTdhLWUyNmE0OGUxYzI2YiIsImMiOjl9&pageName=ReportSectionf020514ee301d3b91713&filter=public_x0020_Scenarios/id%20eq%20${fileId}`
    
    let solverFeedback = ""
    let textArea
    import {io} from "socket.io-client"
    let socket = io()
    onMount(()=>{
            if(textArea != null){
                socket.on('solverFeedback', (text)=>{
                solverFeedback += text
                textArea.scrollTop = textArea.scrollHeight
            })
        }
    })
    

    async function deleteFile(id){
        if(confirm(`Are you sure you want to delete Scenario #${id} ?`)){
            $show_delete_scenario_popup = true
            const res = await fetch(`/scenarios/deleteScenario/${id}`, {method:'DELETE'})
            const result = await res.json()

            if(result.success){
                window.location.reload()
            }
            else{
                alert(`Error deleting scenario #${id}`)
            }
            
        }
        
    }

    function downloadInput(id){
        window.location.href = `/scenarios/downloadInput/${id}`
    }

    function downloadSolved(id){
        window.location.href = `/scenarios/downloadSolved/${id}`
    }

    function downloadLogFile(id){
        window.location.href = `/scenarios/downloadLog/${id}`
    }

    async function sendToQueue(id){
        $show_send_to_queue_popup = true
        const res = await fetch(`/solver/sendToQueue/${id}`, {method: 'POST'})
        const result = await res.json()

        if(result.success){
            
            window.location.href = "/queue"
        }
        else{
            alert(`Error sending scenario #${id} to solver.`)
        }
    }

    async function killSolver(id){
        const text = `Are you sure you want to kill scenario ${id} while busy solving ?`
        if(confirm(text)){
            $show_kill_solver_popup = true
            const res = await fetch(`/solver/killSolver/${id}`, {method: 'DELETE'})
            const result = await res.json()

            if(result.success){
                window.location.href = "/error"
            }
            else{
                alert('Error stopping scenario')
            }
        }
        
    }

    async function dequeueScenario(id){
        await fetch(`/solver/dequeueSolver/${id}`, {method: 'POST'})
    }

    function dateFormat(datetime){
        let date = datetime.split('T')
        date[1] = date[1].split('.')
        return date[0] + " " + date[1][0]
    }

    onDestroy(()=>{
        socket.disconnect()
    })

</script>

<div class="card shadow-lg form-container p-3 mt-4 mb-1 {cardColour}">
    <div class="grid grid-cols-2 justify-items-stretch">
        <div class="justify-self-start">
            <h1 class="text-xl font-bold">
                #{fileId} - {scenarioCode} 
            </h1>
        </div>
        <div class="justify-self-end">
            {#if !disableSolver && status === 0}
            <div class="tooltip tooltip-bottom font-bold" data-tip="Send to Solver Queue">
                <button class="btn btn-sm btn-primary btn-outline btn-circle" id="solverButton" on:click={sendToQueue(fileId)}><i class="fas fa-paper-plane"></i></button>
            </div>
            {/if}
            <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Download Input File">
                <button class="btn btn-sm btn-circle btn-warning btn-outline" on:click={downloadInput(fileId, fileName)}><i class="fas fa-file-download"></i></button>
            </div>
            {#if status === 4}
            <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Download Solved File">
                <button class="btn btn-sm btn-accent btn-circle btn-outline" on:click={downloadSolved(fileId)}><i class="fas fa-file-download"></i></button>
            </div>
            {/if}
            {#if status == 4 || status == 5}
            <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Download Log File">
                <button class="btn btn-sm btn-secondary btn-circle btn-outline" on:click={downloadLogFile(fileId)}><i class="fas fa-file-download"></i></button>
            </div>
            {/if}
            {#if status != 1 && status != 2 && status != 3 && status != 6}
            <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Delete">
                <button class="btn btn-sm btn-error btn-circle btn-outline" on:click={deleteFile(fileId)}><i class="fas fa-trash"></i></button>
            </div>
            {/if}
            {#if status == 1 || status == 2 || status == 3}
            <div class="tooltip tooltip-bottom font-bold ml-3 mr-3" data-tip="Kill Solver">
                <button class="btn btn-sm btn-error btn-circle btn-outline" on:click={killSolver(fileId)}><i class="fas fa-skull"></i></button>
            </div>
            {/if}
            {#if status == 6}
            <div class="tooltip tooltip-bottom font-bold ml-3 mr-3" data-tip="Dequeue">
                <button class="btn btn-sm btn-error btn-circle btn-outline" on:click={dequeueScenario(fileId)}><i class="fas fa-minus"></i></button>
            </div>
            {/if}
            {#if status === 4}
            <!--
            <div class="tooltip tooltip-bottom font-bold ml-3 mr-3" data-tip="PowerBi">
                <a href="{powerBiLink}" target="_blank">
                    <button class="btn btn-sm btn-secondary-content btn-circle btn-outline"><i class="fas fa-file-chart-line"></i></button>
                </a>
            </div>
            -->
            {/if}
        </div>
    </div>
    <div class="grid grid-cols-2 mt-2 text">
        <span class="text-sm">
            File Name : {fileName}
        </span>
        <div class="grid justify-items-end">
            <span class="text-sm">
                Upload Date & Time : {dateFormat(uploadedDateTime)} (UTC)
            </span>
        </div>
    </div>
    <div class="grid grid-cols-2">
        <span class="pt-1 text-sm">
            Demand: {demand}M
        </span>
        {#if status == 4}
            <div class="grid justify-items-end">
                <span class="pt-1 text-sm">
                    Solved Date & Time : {dateFormat(solvedDateTime)} (UTC)
                </span>
            </div>
        {/if}
    </div>

    <div class="grid grid-cols-1 justify-items-center">
        {#if status == 1 || status == 2 || status == 3}
            <h1 class="text-xl font-bold mt-5">Solver Feedback</h1>
            <textarea class="text-white mt-2 pl-3" value={solverFeedback} bind:this={textArea} disabled></textarea>
        {/if}
    </div>

    {#if status === 5}
        <div class="card border rounded-box bg-base-100 mt-5">
            <h1 class="font-bold text-l pl-5 pt-3 pb-5">
                Error message
            </h1>
            <p class="pl-5 pb-3">
                {errorMessage}
            </p>
        </div>
    {/if}
</div>

<style>
    textarea{
        width: 75%;
        height: 150px;
    }
</style>
