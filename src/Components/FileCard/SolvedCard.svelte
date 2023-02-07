<script>

    import {show_delete_scenario_popup} from '../../Stores/delete_scenario_popup'

    export let fileId;
    export let fileName;
    export let uploadedDateTime;
    export let solvedDateTime;
    export let scenarioCode;
    export let cardColour;
    export let demand

    async function deleteFile(){
        if(confirm(`Are you sure you want to delete Scenario #${fileId} ?`)){
            $show_delete_scenario_popup = true
            const res = await fetch(`/scenarios/deleteScenario/${fileId}`, {method:'DELETE'})
            const result = await res.json()

            if(result.success){
                window.location.reload()
            }
            else{
                alert(`Error deleting scenario #${fileId}`)
            }
            
        }
    }

    function downloadInput(){
        window.location.href = `/scenarios/downloadInput/${fileId}`
    }

    function downloadSolved(){
        window.location.href = `/scenarios/downloadSolved/${fileId}`
    }

    function downloadLogFile(){
        window.location.href = `/scenarios/downloadLog/${fileId}`
    }

    function dateFormat(datetime){
        let date = datetime.split('T')
        date[1] = date[1].split('.')
        return date[0] + " " + date[1][0]
    }
</script>

<div class="card shadow-lg form-container p-3 mt-4 mb-1 {cardColour}">
    <div class="grid grid-cols-2 justify-items-stretch">
        <div class="justify-self-start">
            <h1 class="text-xl font-bold">
                #{fileId} - {scenarioCode} 
            </h1>
        </div>
        <div class="justify-self-end">
            <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Download Input File">
                <button class="btn btn-sm btn-circle btn-warning btn-outline" on:click={()=>downloadInput()}><i class="fas fa-file-download"></i></button>
            </div>

            <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Download Solved File">
                <button class="btn btn-sm btn-accent btn-circle btn-outline" on:click={()=>downloadSolved()}><i class="fas fa-file-download"></i></button>
            </div>


            <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Download Log File">
                <button class="btn btn-sm btn-secondary btn-circle btn-outline" on:click={()=>downloadLogFile()}><i class="fas fa-file-download"></i></button>
            </div>


            <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Delete">
                <button class="btn btn-sm btn-error btn-circle btn-outline" on:click={()=>deleteFile()}><i class="fas fa-trash"></i></button>
            </div>

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

        <div class="grid justify-items-end">
            <span class="pt-1 text-sm">
                Solved Date & Time : {dateFormat(solvedDateTime)} (UTC)
            </span>
        </div>
    </div>
</div>
