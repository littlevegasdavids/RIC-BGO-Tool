<script>
    import { onMount } from "svelte";
    import FileCard from "../FileCard.svelte";
    import DeleteScenarioPopup from "../Popups/Delete_Scenario_Popup.svelte";
    import {show_delete_scenario_popup} from '../../Stores/delete_scenario_popup'

    let solvedScenarios = []
    let finalScenarios = []

    let loading = true

    let users_information_filter
    let role_id = "N/A"

    onMount(async ()=>{
        const res = await fetch('/scenarios/solved')
        const result = await res.json()

        if(result.success){
            solvedScenarios = result.scenarios
            finalScenarios = solvedScenarios
        }
        else{
            alert('Error getting solved scenarios from server')
        }

        const user_id_res = await fetch('/user/getAllUserIds')
        const user_json = await user_id_res.json()

        if(!user_json.success){
            alert('Cannot find users information for filtering')
        }
        else{
            users_information_filter = user_json.user_ids
        }

        const role_res = await fetch('/user/getUserInfo')
        const role_json = await role_res.json()

        role_id = role_json.role_id

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

    //FILTERING OPTIONS
    let searchValue = ""
    let searchSelectValue;
    let startDate
    let endDate
    let filterSkuTypeValue
    let user_file_input_select = false
    let user_id_filter

    function filterScenarios(){
        finalScenarios = solvedScenarios

        let search = searchValue.toLowerCase()

        if(searchSelectValue == "User (Input File)"){
            user_file_input_select = true
            if(user_id_filter != undefined){
                finalScenarios = solvedScenarios.filter((file) => {return file.user_id == user_id_filter})
            }
        }
        else{
            user_file_input_select = false
        }
        if(search.trim() != ""){
            if(searchSelectValue == "File Name"){
                finalScenarios = solvedScenarios.filter((file) => {return file.input_filename.toLowerCase().includes(search)})
            }
            else if (searchSelectValue == "Scenario Code"){
                finalScenarios = solvedScenarios.filter((file) => {return file.scenario_code.toLowerCase().includes(search)})
            }
            else if (searchSelectValue == "Demand"){
                finalScenarios = solvedScenarios.filter((file) => {return file.demand.toLowerCase().includes(search)})
            }
        }
        
        if(startDate != null && startDate != ""){
            // Date Range given
            if(endDate != null && endDate != ""){
                let start = new Date(startDate)
                let end = new Date(endDate)
                start.setHours(0,0,0,0) 
                end.setHours(23,59,59,59) 
                if(new Date(endDate) >= new Date(startDate)){
                    finalScenarios = solvedScenarios.filter(file =>{
                        let date = new Date(file.upload_date)
        
                        return (date > start && date <= end)
                    })

                }
            }
            else{
                let start = new Date(startDate)

                finalScenarios = solvedScenarios.filter(file =>{
                    let date = new Date(file.upload_date)
                    return date > start
                })
            }
        }
        if(filterSkuTypeValue == "Sku"){
            finalScenarios = solvedScenarios.filter(file => file.sku_type == "sku")
        }
        else if(filterSkuTypeValue == "Grp"){
            finalScenarios = solvedScenarios.filter(file => file.sku_type == "grp")
        }
    }
</script>

{#if !loading}
<div class="flex flex-col">
    {#if $show_delete_scenario_popup}
        <DeleteScenarioPopup />
    {/if}
    {#if solvedScenarios.length != 0}
    <div class="form-control flex-row justify-center mt-5" on:change={filterScenarios} on:input={filterScenarios}>
        {#if !user_file_input_select}
        <input type="text" id="searchField" class="input input-bordered mt-5 mb-5 w-44" placeholder="Search" bind:value={searchValue}>
        {:else}
            {#if role_id != 3 && role_id != "NaN"}
            <select class="select select-bordered mt-5 ml-3 w-40" bind:value={user_id_filter}>
                {#each users_information_filter as user}
                    <option value={user.id}>{user.name}</option>
                {/each}
            </select>
            {/if}
        {/if}
        <select class="select select-bordered mt-5 ml-3 w-40" bind:value={searchSelectValue}>
            <option selected>File Name</option>
            <option>Scenario Code</option>
            <option>Demand</option>
            {#if role_id != 3 && role_id != "NaN"}
                <option>User (Input File)</option>
            {/if}
        </select>
        <span class="text-xl mt-8 mx-2 text-secondary">
            <div class="tooltip" data-tip="Use search bar to search scenario by file name, scenario code or demand. If filtering by user, then select the user you would like to filter by.">
                <i class="far fa-info-circle"></i>
            </div>
        </span>
        <input type="date" id="startDate"class="bg-base-100 border-solid border-2 mt-6 ml-3 max-h-10 pl-2 w-40" bind:value={startDate}>
        <input type="date" id="endDate" class="bg-base-100 border-solid border-2 mt-6 ml-3 max-h-10 pl-2 w-40" bind:value={endDate}>
        <span class="text-xl mt-8 mx-2 text-secondary">
            <div class="tooltip" data-tip="Filter scenarios by the date they were uploaded. The left most date input is the start of the date range and the right most date input is the end of the date range. The date range is inclusive meaning that if a scenario was uploaded on a certain on the start or end date then it will be included in the filtering">
                <i class="far fa-info-circle"></i>
            </div>
        </span>
        <select class="select select-bordered mt-5 ml-3" bind:value={filterSkuTypeValue}>
            <option selected>None</option>
            <option>Sku</option>
            <option>Grp</option>
        </select>
        <span class="text-xl mt-8 mx-2 text-secondary">
            <div class="tooltip" data-tip="Filter scenarios by SKU or GRP type">
                <i class="far fa-info-circle"></i>
            </div>
        </span>
        <button class="btn btn-error mt-5 ml-3" on:click={()=>{window.location.reload()}}>Refresh<i class="fas fa-redo"></i></button>
    </div>
    {/if}
    <div class="tabs tabs-boxed justify-center mx-auto">
        <a class="tab" href="/">Ready</a>
        <a class="tab" href="/queue">Busy / Queue</a>
        <a class="tab tab-active" href="/solved">Solved</a>
        <a class="tab" href="/error">Error</a>
    </div>

    {#if solvedScenarios.length != 0}
        {#if finalScenarios.length != 0}
        <div class="card shadow-lg mt-5 bg-primary">
            <div class="card-body">
                <p class="card-title text-black text-center text-3xl">Solved</p>
                {#each finalScenarios as file}
                    <FileCard fileId={file.id} fileName={file.input_filename} uploadedDateTime={file.upload_date} disableSolver={true} 
                    solvedDateTime={file.solved_date} status={file.scenario_status} errorMessage={""} scenarioCode = {file.scenario_code} cardColour={getCardColour()}
                    demand={file.demand}/>
                {/each}
            </div>
        </div>
        {/if}
    {:else}
        <p class="text-center font-bold text-2xl pt-10">Currently no solved scenarios</p>
    {/if}

    
</div>
{:else}
    <p class="text-center font-bold text-4xl pt-10">Loading<i class="fas fa-spinner fa-spin ml-3"></i></p>
{/if}
