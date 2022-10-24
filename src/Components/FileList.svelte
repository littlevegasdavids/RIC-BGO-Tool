<script>
    import { onMount } from 'svelte';
    import FileCard from './FileCard.svelte'

    let users_information_filter

    onMount(async ()=>{
        const user_id_res = await fetch('/user/getAllUserIds')
        const user_json = await user_id_res.json()
        if(!user_json.success){
            alert('Cannot find users information for filtering')
        }
        else{
            users_information_filter = user_json.user_ids
            console.log(users_information_filter)
        }
    })


    export let excelFileReady;
    export let excelFileBusy;
    export let excelFileSolved;
    export let excelFileError;
    export let excelFileQueue
    let fileReady = [];
    let fileBusy = [];
    let fileSolved = [];
    let fileError = []
    let fileQueue = []
    let searchValue = ""
    let searchSelectValue;
    let busyStatus = ""
    let startDate
    let endDate
    let filterSkuTypeValue
    let user_file_input_select = false
    let user_id_filter

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

    //Filtering
    $:{
        excelFileReady.sort((a, b)=>{
            return b.id - a.id
        })

        excelFileBusy.sort((a, b)=>{
            return b.id - a.id
        })

        excelFileSolved.sort((a, b)=>{
            return b.id - a.id
        })

        excelFileError.sort((a, b)=>{
            return b.id - a.id
        })

        excelFileQueue.sort((a, b)=>{
            return b.id - a.id
        })

        fileReady = excelFileReady;
        fileBusy = excelFileBusy;
        fileSolved = excelFileSolved;
        fileError = excelFileError;
        fileQueue = excelFileQueue;
        
        if(fileBusy.length != 0){
            switch(fileBusy[0].scenario_status){
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

        fileReady = excelFileReady;
        fileBusy = excelFileBusy;
        fileSolved = excelFileSolved;
        fileError = excelFileError;
        fileQueue = excelFileQueue;
        let search = searchValue.toLowerCase()
        if(searchSelectValue == "User (Input File)"){
            user_file_input_select = true
            if(user_id_filter != undefined){
                fileReady = excelFileReady.filter((file) => {return file.user_id == user_id_filter})
                fileBusy = excelFileBusy.filter((file) => {return file.user_id == user_id_filter})
                fileSolved = excelFileSolved.filter((file) => {return file.user_id == user_id_filter})
                fileError = excelFileError.filter((file) => {return file.user_id == user_id_filter})
                fileQueue = excelFileQueue.filter((file) => {return file.user_id == user_id_filter})
            }
        }
        else{
            user_file_input_select = false
        }
        if(search.trim() != ""){
            if(searchSelectValue == "File Name"){
                fileReady = excelFileReady.filter((file) => {return file.input_filename.toLowerCase().includes(search)})
                fileBusy = excelFileBusy.filter((file) => {return file.input_filename.toLowerCase().includes(search)})
                fileSolved = excelFileSolved.filter((file) => {return file.input_filename.toLowerCase().includes(search)})
                fileError = excelFileError.filter((file) => {return file.input_filename.toLowerCase().includes(search)})
                fileQueue = excelFileQueue.filter((file) => {return file.input_filename.toLowerCase().includes(search)})
            }
            else if (searchSelectValue == "Scenario Code"){
                fileReady = excelFileReady.filter((file) => {return file.scenario_code.toLowerCase().includes(search)})
                fileBusy = excelFileBusy.filter((file) => {return file.scenario_code.toLowerCase().includes(search)})
                fileSolved = excelFileSolved.filter((file) => {return file.scenario_code.toLowerCase().includes(search)})
                fileError = excelFileError.filter((file) => {return file.scenario_code.toLowerCase().includes(search)})
                fileQueue = excelFileQueue.filter((file) => {return file.scenario_code.toLowerCase().includes(search)})
            }
            else if (searchSelectValue == "Demand"){
                fileReady = excelFileReady.filter((file) => {return file.demand.toLowerCase().includes(search)})
                fileBusy = excelFileBusy.filter((file) => {return file.demand.toLowerCase().includes(search)})
                fileSolved = excelFileSolved.filter((file) => {return file.demand.toLowerCase().includes(search)})
                fileError = excelFileError.filter((file) => {return file.demand.toLowerCase().includes(search)})
                fileQueue = excelFileQueue.filter((file) => {return file.demand.toLowerCase().includes(search)})
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
                    fileReady = fileReady.filter(file =>{
                        let date = new Date(file.upload_date)
        
                        return (date > start && date <= end)
                    })

                    fileBusy = fileBusy.filter(file =>{
                        let date = new Date(file.upload_date)
                        
                        return (date > start && date <= end)
                    })
                
                    fileError = fileError.filter(file =>{
                        let date = new Date(file.upload_date)
                        
                        return (date > start && date <= end)
                    })

                    fileSolved = fileSolved.filter(file =>{
                        let date = new Date(file.upload_date)
                        
                        
                        return (date > start && date <= end)
                    })

                    fileQueue = fileQueue.filter(file =>{
                        let date = new Date(file.upload_date)
                        
                        return (date > start && date <= end)
                    })
                }
                else{
                    // Keep File Listing as the same because end date < start date
                }
            }
            else{
                let start = new Date(startDate)

                fileReady = fileReady.filter(file =>{
                    let date = new Date(file.upload_date)
                    return date > start
                })
                fileBusy = fileBusy.filter(file =>{
                    let date = new Date(file.upload_date)
                    return date > start
                })

                fileError = fileError.filter(file =>{
                    let date = new Date(file.upload_date)
                    return date > start
                })

                fileSolved = fileSolved.filter(file =>{
                    let date = new Date(file.upload_date)
                    return date > start
                })

                fileQueue = fileQueue.filter(file =>{
                    let date = new Date(file.upload_date)
                    return date > start
                })
            }
        }

        if(filterSkuTypeValue == "Sku"){
            fileReady = fileReady.filter(file => file.sku_type == "sku")
            fileBusy = fileBusy.filter(file => file.sku_type == "sku")
            fileSolved = fileSolved.filter(file => file.sku_type == "sku")
            fileError = fileError.filter(file => file.sku_type == "sku")
            fileQueue = fileQueue.filter(file => file.sku_type == "sku")
        }
        else if(filterSkuTypeValue == "Grp"){
            fileReady = fileReady.filter(file => file.sku_type == "grp")
            fileBusy = fileBusy.filter(file => file.sku_type == "grp")
            fileSolved = fileSolved.filter(file => file.sku_type == "grp")
            fileError = fileError.filter(file => file.sku_type == "grp")
            fileQueue = fileQueue.filter(file => file.sku_type == "grp")
        }
    }
</script>


<div class="flex flex-col">
    {#if excelFileReady.length != 0 || excelFileBusy.length != 0 || excelFileSolved.length != 0 || excelFileError.length != 0 || excelFileQueue != 0}
        <div class="form-control flex-row justify-center mt-5">
            {#if !user_file_input_select}
            <input type="text" id="searchField" class="input input-bordered mt-5 mb-5 w-44" placeholder="Search" bind:value={searchValue}>
            {:else}
            <select class="select select-bordered mt-5 ml-3 w-40" bind:value={user_id_filter}>
                {#each users_information_filter as user}
                    <option value={user.id}>{user.name}</option>
                {/each}
            </select>
            {/if}
            <select class="select select-bordered mt-5 ml-3 w-40" bind:value={searchSelectValue}>
                <option selected>File Name</option>
                <option>Scenario Code</option>
                <option>Demand</option>
                <option>User (Input File)</option>
            </select>
            <span class="text-xl mt-8 mr-2 text-secondary">
                <div class="tooltip" data-tip="Use search bar to search scenario by file name, scenario code or demand. If filtering by user, then select the user you would like to filter by.">
                    <i class="far fa-info-circle"></i>
                </div>
            </span>
            <input type="date" id="startDate"class="bg-base-100 border-solid border-2 mt-6 ml-3 max-h-10 pl-2 w-40" bind:value={startDate}>
            <input type="date" id="endDate" class="bg-base-100 border-solid border-2 mt-6 ml-3 max-h-10 pl-2 w-40" bind:value={endDate}>
            <span class="text-xl mt-8 mr-2 text-secondary">
                <div class="tooltip" data-tip="Filter scenarios by the date they were uploaded. The left most date input is the start of the date range and the right most date input is the end of the date range. The date range is inclusive meaning that if a scenario was uploaded on a certain on the start or end date then it will be included in the filtering">
                    <i class="far fa-info-circle"></i>
                </div>
            </span>
            <select class="select select-bordered mt-5 ml-3" bind:value={filterSkuTypeValue}>
                <option selected>None</option>
                <option>Sku</option>
                <option>Grp</option>
            </select>
            <span class="text-xl mt-8 mr-2 text-secondary">
                <div class="tooltip" data-tip="Filter scenarios by SKU or GRP type">
                    <i class="far fa-info-circle"></i>
                </div>
            </span>
            <button class="btn btn-error mt-5 ml-3" on:click={()=>{window.location.href="/"}}>Reset<i class="fas fa-redo"></i></button>
        </div>
    {/if}
    
    <!--Busy list-->
    {#if fileBusy.length != 0}
        <div class="collapse collapse-open collapse-arrow rounded-box shadow-lg form-container bg-accent p-3 mt-5" id="busyCard">
            <input type="checkbox" on:input={()=>document.getElementById('busyCard').classList.remove('collapse-open')}>
            <div class="collapse-title text-xl font-bold text-black">
                Busy - {busyStatus}<i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="collapse-content">
                {#each fileBusy as file}
                    <FileCard fileId={file.id} fileName={file.input_filename} uploadedDateTime={file.upload_date} disableSolver={true} 
                    solvedDateTime={""} status={file.scenario_status} errorMessage={""} scenarioCode = {file.scenario_code} cardColour={getCardColour()} 
                    demand={file.demand}/>
                {/each}
            </div>
        </div>
    {/if}
    
    <!--Queue list-->
    {#if fileQueue.length != 0}
        <div class="collapse collapse-open collapse-arrow rounded-box shadow-lg form-container bg-accent-content p-3 mt-5" id="queueCard">
            <input type="checkbox" on:input={()=>document.getElementById('queueCard').classList.remove('collapse-open')}>
            <div class="collapse-title text-xl font-bold text-black">
                Queue
            </div>
            <div class="collapse-content">
                {#each fileQueue as file}
                    <FileCard fileId={file.id} fileName={file.input_filename} uploadedDateTime={file.upload_date} disableSolver={false} 
                    solvedDateTime={""} status={file.scenario_status} errorMessage={""} scenarioCode = {file.scenario_code} cardColour={getCardColour()} 
                    demand={file.demand}/>
                {/each}
            </div>
        </div>
    {/if}
    
    <!--Ready list-->
    {#if fileReady.length != 0}
        <div class="collapse collapse-open collapse-arrow rounded-box shadow-lg form-container bg-info p-3 mt-5" id="readyCard">
            <input type="checkbox" on:input={()=>document.getElementById('readyCard').classList.remove('collapse-open')}>
            <div class="collapse-title text-xl font-bold text-black">
                Ready
            </div>
            <div class="collapse-content">
                {#each fileReady as file}
                    <FileCard fileId={file.id} fileName={file.input_filename} uploadedDateTime={file.upload_date} disableSolver={false} 
                    solvedDateTime={""} status={file.scenario_status} errorMessage={""} scenarioCode = {file.scenario_code} cardColour={getCardColour()} 
                    demand={file.demand}/>
                {/each}
            </div>
        </div>
    {/if}
    
    <!--Solved list-->
    {#if fileSolved.length != 0}
        <div class="collapse collapse-open collapse-arrow rounded-box shadow-lg form-container bg-primary p-3 mt-5" id="solvedCard">
            <input type="checkbox" on:input={()=>document.getElementById('solvedCard').classList.remove('collapse-open')}>
            <div class="collapse-title text-xl font-bold text-black">
                Solved
            </div>
            <div class="collapse-content">
                {#each fileSolved as file}
                    <FileCard fileId={file.id} fileName={file.input_filename} uploadedDateTime={file.upload_date} disableSolver={true} 
                    solvedDateTime={file.solved_date} status={file.scenario_status} errorMessage={""} scenarioCode = {file.scenario_code} cardColour={getCardColour()}
                    demand={file.demand}/>
                {/each}
            </div>
        </div>
    {/if}
    
    <!--Error list-->
    {#if fileError.length != 0}
        <div class="collapse collapse-open collapse-arrow rounded-box shadow-lg form-container bg-error p-3 mt-5" id="errorCard">
            <input type="checkbox" on:input={()=>document.getElementById('errorCard').classList.remove('collapse-open')}>
            <div class="collapse-title text-xl font-bold text-black">
                Error
            </div>
            <div class="collapse-content">
                {#each fileError as file}
                    <FileCard fileId={file.id} fileName={file.input_filename} uploadedDateTime={file.upload_date} disableSolver={true} 
                    solvedDateTime={file.solved_date} status={file.scenario_status} errorMessage={file.error_message} scenarioCode = {file.scenario_code} cardColour={getCardColour()} demand={file.demand}/>
                {/each}
            </div>
        </div>
    {/if}

</div>

<style>
    i{
        margin-left: 5px;
    }
</style>
