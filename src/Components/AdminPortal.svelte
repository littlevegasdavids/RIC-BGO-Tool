<script>
    let showErrorMsg = false;
    let templateFile;
    let submitBtn;
    let users = []
    let templateFileName = ""

    // List of users
    async function getUsers(){
        const resUsers = await fetch('/admin/getUsers')
        const resUsersJson = await resUsers.json()

        resUsersJson.sort((a,b)=>{
            return a.id - b.id
        })

        users = resUsersJson
    }
    getUsers()

    // Template upload form
    $: {
        showErrorMsg = false;
        if(templateFile) {
            if(templateFile.length != 0){
                // File extension
                const ext = templateFile[0].name.split('.').pop()
                //File size in mb
                const fileSize = templateFile[0].size / 100000
                if(!ext === 'xlsx'){
                    showErrorMsg = true;
                    submitBtn.disabled = true
                }
                else{
                    templateFileName = templateFile[0].name
                    console.log(templateFile[0].name)
                    submitBtn.disabled = false
                }
            }
            else{
                submitBtn.disabled = true
            }
            
        }
        
    }
    //#region Template file 
    function downloadTemplate(){
        window.location.href = '/scenarios/downloadTemplate'
    }
    
    let tempalteFileName = ""
    let tempalteDate = ""
    async function getTemplateInfo(){
        const res = await fetch('/admin/getTemplateInfo')
        const response = await res.json()
        tempalteFileName = response[0].file_name
        tempalteDate = response[0].upload_date.split('T')[0]
    }
    getTemplateInfo()
    //#endregion

    async function deleteUser(id){
        const text = `Are you sure you want to delete User #${id}?`
        if(confirm(text)){
            const res = await fetch(`/admin/deleteUser/${id}`, {method: 'DELETE'})
            const response = await res.json()
            if(response.success){
                window.location.href = '/adminPortal'
            }
        }
    }

    function addNewUser(){
        window.location.href = "/createUser"
    }

    async function changeUserRole(id, og_role_id, new_role_id){
        let text = ""
        let fromIdName = ""
        let toIdName = ""

        if(og_role_id == 1){
            fromIdName = "Admin"
        }
        else if(og_role_id == 2){
            fromIdName = "Super User"
        }
        else{
            fromIdName = "User"
        }

        if(new_role_id == 1){
            toIdName = "Admin"
        }
        else if(new_role_id == 2){
            toIdName = "Super User"
        }
        else{
            toIdName = "User"
        }
        text = `Are you sure you want to change User ${id} to role from ${fromIdName} to ${toIdName}`
        if(confirm(text)){
            const res = await fetch(`/admin/changeUserRole/${id}/${new_role_id}`, {method: 'POST'})
            const response = await res.json()
            if(response.success){
                window.location.href = "/adminPortal"
            }
        }
        else{
            window.location.href = "/adminPortal"
        }
    }

    function changePassword(id){
        window.location.href = `/changePasswordAdmin/${id}`
    }

    function promptAndDisableBtn(e){
        if(confirm(`Are you sure you want to change the template file to ${templateFileName}`)){
            submitBtn.disabled = true
            e.target.submit()
        }
        else{
            window.location.href = "/adminPortal"
        }
    }
</script>

{#if showErrorMsg}
    <p class="text-error">Invalid file input</p>
{/if}

<form action= "/admin/uploadTemplate" id="uploadForm" method="post" enctype="multipart/form-data" on:submit|preventDefault={promptAndDisableBtn}>
    <div class="card shadow-lg form-container bg-accent-focus">
        <div class="p-3">
            <div class="flex justify-between">
                <p class="text-lg font-bold pb-3 underline">Upload & Change Template Excel File</p>
                <p>{tempalteDate} - {tempalteFileName}</p>
            </div>
            
            <input type="file" name="templateFile" id="templateFile" accept=".xlsx" class="" bind:files={templateFile}>
            <button type="submit" id="submitBtn" class="btn btn-primary" disabled bind:this={submitBtn} >
                Upload File<i class="fas fa-file-upload pl-2"></i>
            </button>
            <button type="button" class="btn btn-white ml-3" on:click={downloadTemplate}>
                Download template file<i class="fas fa-file-download pl-2"></i>
            </button>
        </div>
    </div>
</form>

{#if users.length != 0}
<div class="grid grid-cols-3 justify-items-center mt-5">
    <span></span>
    <h1 class="font-bold text-3xl underline">Users Tables</h1>
    <button class="btn btn-primary" on:click={addNewUser}>
        Add New User<i class="fas fa-plus pl-2"></i> 
    </button>
</div>

<div class="overflow-x-auto w-full mt-5">
    <table class="table table-zebra w-full">
        <thead>
            <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each users as user}
            <tr>
                <th>{user.id}</th>
                <th>{user.name}</th>
                <th>{user.email}</th>
                <th>
                    {#if user.role_id == 1}
                    <select class="select select-bordered w-full max-w-xs" on:input={changeUserRole(user.id, 1, this.value)}>
                        <option value=1 selected disabled>Admin</option>
                        <option value=2>Super user</option>
                        <option value=3>User</option>
                    </select>
                    {:else if user.role_id == 2}
                        <select class="select select-bordered w-full max-w-xs" on:input={changeUserRole(user.id, 2, this.value)}>
                            <option value=1>Admin</option>
                            <option value=2 selected disabled>Super user</option>
                            <option value=3>User</option>
                        </select>
                    {:else if user.role_id == 3}
                    <select class="select select-bordered w-full max-w-xs" on:input={changeUserRole(user.id, 3, this.value)}>
                        <option value=1>Admin</option>
                        <option value=2>Super user</option>
                        <option value=3 selected disabled>User</option>
                    </select>
                    {/if}
                </th>
                <th>
                    <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Delete">
                        <button class="btn btn-sm btn-error btn-circle btn-outline" on:click={deleteUser(user.id)}><i class="fas fa-trash"></i></button>
                    </div>
                    <div class="tooltip tooltip-bottom font-bold ml-3" data-tip="Change Password">
                        <button class="btn btn-sm btn-error btn-circle btn-outline" on:click={changePassword(user.id)}><i class="fas fa-key"></i></button>
                    </div>
                </th>
            </tr>
            {/each}
        </tbody>
    </table>
</div>
{/if}

<style>
    #uploadForm{
        max-width: 750px;
        margin: 0 auto;
        padding-top: 5px;
        padding-bottom: 5px;
    }
    .form-container{
        margin: 5px;
    }
</style>