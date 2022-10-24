<script>
    let createUserError
    $: passwordInputBorder = ""
    $: createUserError = ""
    async function createUser(e){
        if(passwordInputBorder == ""){
            const formData = new FormData(e.target)
            const data = {}
            for(let field of formData){
                const [key, value] = field
                data[key] = value
            }
            
            const res = await fetch('/admin/createNewUser', {
                method: 'POST', credentials: 'same-origin',
                "body": JSON.stringify(data),
                headers:{
                    'Content-Type':'application/json'
                }
            })

            const response = await res.json()
            if(!response.success){
                createUserError = response.message
            }
            else{
                window.location.href = "/adminPortal"
            }
           
        }
        else{
            createUserError = "Password fields do not match"
        } 
    }

    function checkPassword(){
        var passValue = document.getElementById('inputPass').value
        var passConfirmValue = document.getElementById('inputPassConfirm').value
        createUserError = ""
        
        if(passValue == ""){
            passwordInputBorder = ""
            createUserError = ""
        }
        else{
            if(passValue != passConfirmValue){
                passwordInputBorder = "input-error"
            }
            else{
                passwordInputBorder = ""
                createUserError = ""
            }
        }
    }
</script>

<div class="form-control" id="newUserFormContainer" on:submit|preventDefault={createUser}>
    <form class="newUserForm">
        <div class="card bg-primary">
            <div class="card-body">
                <p class="formLabel font-bold text-l">NAME</p>
                <input type="text" placeholder="Enter User's Name" class="input input-bordered" name="name">

                <p class="formLabel font-bold text-l">EMAIL</p>
                <input type="text" placeholder="Enter User's Email" class="input input-bordered" name="email">

                <p class="formLabel font-bold text-l">ROLE</p>
                <select class="select select-bordered" name="role_id">
                    <option disabled select>Select Role</option>
                    <option value = 1>Admin</option>
                    <option value = 2>Super User</option>
                    <option value = 3>User</option>
                </select>

                <p class="formLabel font-bold text-l">PASSWORD</p>
                <input type="password" placeholder="Enter User's Password" class="input input-bordered {passwordInputBorder}" id="inputPass" name="password">

                <p class="formLabel font-bold text-l">CONFIRM PASSWORD</p>
                <input type="password" placeholder="Confirm Password" class="input input-bordered {passwordInputBorder}" id="inputPassConfirm" name="passwordConfirm" on:input={checkPassword}>

                <button class="btn btn-outline mt-3" id="createUserBtn" type="submit">Create User</button>
                {#if createUserError != ""}
                    <p class="mt-3 text-black font-bold">{createUserError}</p>
                {/if}
            </div>
        </div>
    </form>
</div>


<style>
    #newUserFormContainer{
        max-width: 750px;
        margin: 0 auto;
    }

    .formLabel{
        margin-left: 1px;
        margin-top: 10px;

    }
</style>