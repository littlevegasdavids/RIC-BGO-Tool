<script>
    import { onDestroy, onMount } from "svelte";
    import FileCard from "../FileCard.svelte";
    import {io} from 'socket.io-client'
    import KillSolverPopup from "../Popups/Kill_Solver_Popup.svelte";
    import {show_kill_solver_popup} from '../../Stores/kill_solver_popup'

    let queueScenarios = []
    let busyScenario = []
    let busyStatus = ""

    let loading = true

    let socket = io()

    let user_id
    let role_id

    onMount(async ()=>{
        const res = await fetch('/user/getUserInfo')
        const json = await res.json()

        let user_id = json.user_id
        let role_id = json.role_id

        socket.emit('getBusy', {user_id, role_id})
    })

    let interval = setInterval(()=>{
        socket.emit('getBusy', {user_id, role_id})
    }, 3000)

    onDestroy(()=>{
        clearInterval(interval)
        socket.disconnect()
    })

    socket.on('receiveBusyScenarios', (response)=>{
        queueScenarios = response.queue
        busyScenario = response.busy

        if(busyScenario.length != 0){
            switch(busyScenario[0].scenario_status){
                case 1:
                    busyStatus = "Setting up scenario"
                break;

                case 2:
                    busyStatus = "Solving scenario with RIC BGO Tool"
                break;

                case 3:
                    busyStatus = "Writing output file"
                break;
            }
        }

        
        loading = false
    })

    //Alternating card colours
    let cardColourCheck = false
    function getCardColour(){
        let colour;

        if(!cardColourCheck){
            colour = "bg-base-300"
        }
        else{
            colour = "bg-base-100"
        }
        cardColourCheck = !cardColourCheck
        return colour
    }
</script>

{#if !loading}
<div class="flex flex-col">
    {#if $show_kill_solver_popup}
        <KillSolverPopup />
    {/if}
    <div class="tabs tabs-boxed justify-center mx-auto">
        <a class="tab" href="/">Ready</a>
        <a class="tab tab-active" href="/queue">Busy / Queue</a>
        <a class="tab" href="/solved">Solved</a>
        <a class="tab" href="/error">Error</a>
    </div>
    {#if busyScenario.length != 0}
    <div class="card shadow-lg mt-5 bg-accent">
        <div class="card-body">
            <p class="card-title text-black text-center text-3xl">Busy - {busyStatus}<i class="fas fa-spinner fa-spin ml-2"></i></p>
            {#each busyScenario as file}
                <FileCard fileId={file.id} fileName={file.input_filename} uploadedDateTime={file.upload_date} disableSolver={true} 
                solvedDateTime={file.solved_date} status={file.scenario_status} errorMessage={file.error_message} scenarioCode = {file.scenario_code} cardColour={getCardColour()}
                demand={file.demand}/>
            {/each}
        </div>
    </div>
    {/if}

    {#if busyScenario.length == 0  && queueScenarios.length == 0}
        <p class="text-center font-bold text-2xl pt-10">Queue is empty</p>
    {:else}
        {#if queueScenarios.length != 0}
        <div class="card shadow-lg mt-5 bg-accent-content">
            <div class="card-body">
                <p class="card-title text-black text-center text-3xl">Queue</p>
                {#each queueScenarios as file}
                    <FileCard fileId={file.id} fileName={file.input_filename} uploadedDateTime={file.upload_date} disableSolver={true} 
                    solvedDateTime={file.solved_date} status={file.scenario_status} errorMessage={file.error_message} scenarioCode = {file.scenario_code} cardColour={getCardColour()}
                    demand={file.demand}/>
                {/each}
            </div>
        </div>
        {/if}
    {/if}

    
</div>
    
{:else}
    <p class="text-center font-bold text-4xl pt-10">Loading<i class="fas fa-spinner fa-spin ml-3"></i></p>
{/if}
