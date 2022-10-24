<script>
    let showErrorMsg = false;
    let excelFile;
    let submitBtn;
    
    $: {
        //submitBtn.disabled = true
        showErrorMsg = false;
        if(excelFile) {
            if(excelFile.length != 0){
                // File extension
                const ext = excelFile[0].name.split('.').pop()
                //File size in mb
                const fileSize = excelFile[0].size / 100000
                if(ext === 'xlsx'){
                    submitBtn.disabled = false
                }
                else{
                    showErrorMsg = true;
                    submitBtn.disabled = true
                }
            }
            else{
                submitBtn.disabled = true
            }
            
        }
    }
    function downloadTemplate(){
        window.location.href = '/scenarios/downloadTemplate'
    }

    function disableBtn(){
        submitBtn.disabled = true
        setTimeout(() => {
            window.alert('Uploading Scenario. This may take a couple of seconds, press Ok to continue upload')
        }, 500);
        
    }
</script>

{#if showErrorMsg}
    <p class="text-error">Invalid file input</p>
{/if}
<form action="/scenarios/uploadScenario" id="uploadForm" method="post" enctype="multipart/form-data" on:submit={disableBtn}>
    <div class="card shadow-lg form-container bg-warning text-black">
        <div class="p-3">
            <span class="font-bold text-lg underline">Upload scenario</span><br>
            <input type="file" name="excelFile" id="excelFile" accept=".xlsx" class="" bind:files={excelFile}/>
            <button type="submit" id="submitBtn" class="btn btn-primary" disabled bind:this={submitBtn}>
                Upload File<i class="fas fa-file-upload"></i>
            </button>
            <button type="button" class="btn btn-white ml-3" on:click={downloadTemplate}>
                Download template file<i class="fas fa-file-download"></i>
            </button>
        </div> 
    </div>
</form>

<style>
    i{
        padding-left: 5px;
    }

    .form-container{
        margin: 5px;
    }
</style>