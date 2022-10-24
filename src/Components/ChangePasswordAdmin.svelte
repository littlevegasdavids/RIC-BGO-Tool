<script>
    let passwordInputBorder
    let passwordError

    const pathName = window.location.pathname
    const userId = pathName.split('/')[2]

    let showSuccessMessage = false

    $:{
        passwordInputBorder = ""
        passwordError = ""
    }
    async function changePassword(e){
        const formData = new FormData(e.target)
        const data = {}
        for(let field of formData){
            const [key, value] = field
            data[key] = value
        }
        if(data.new_password != data.passwordConfirm){
            passwordError = "Passwords do not match"
        }
        else{
            const res = await fetch(`/admin/changePasswordAdmin/${userId}`, {
                method: 'POST', credentials: 'same-origin',
                "body": JSON.stringify(data),
                headers:{
                    'Content-Type':'application/json'
                }
            })
            const response = await res.json()
            if(!response.success){
                passwordError = response.message
            }
            else{
                showSuccessMessage = true
                setTimeout(() => {
                    window.location.href = "/adminPortal"
                }, 2000);
            }
        }
    }

    async function checkPassword(){
        var passValue = document.getElementById('new_pass').value
        var passConfirmValue = document.getElementById('new_pass_confirm').value
        passwordError = ""

        if(passValue == ""){
            passwordInputBorder = ""
        }
        else{
            if(passValue != passConfirmValue){
                passwordInputBorder = "input-error"
            }
            else{
                passwordInputBorder = ""
            }
        }
    }
</script>

<div class="form-control" id="formPass" on:submit|preventDefault={changePassword}>
    <form>
        <div class="card bg-primary">
            <div class="card-body">
                <p class="formLabel font-bold text-l">NEW PASSWORD</p>
                <input type="password" placeholder="Enter User's Password" class="input input-bordered {passwordInputBorder}" id="new_pass" name="new_password">

                <p class="formLabel font-bold text-l">CONFIRM NEW PASSWORD</p>
                <input type="password" placeholder="Confirm Password" class="input input-bordered {passwordInputBorder}" id="new_pass_confirm" name="passwordConfirm" on:input={checkPassword}>

                <div class="grid grid-2">
                    <button class="btn btn-outline mt-3" id="createUserBtn" type="submit">Change Password</button>
                    <button class="btn btn-error mt-3" on:click={()=>{window.location.href="/adminPortal"}}>Back</button>
                </div>
                {#if passwordError != ""}
                    <p class="mt-3 text-black font-bold">{passwordError}</p>
                {/if}

                {#if showSuccessMessage}
                    <p class="mt-3 text-success font-bold">Successfully changed password</p>
                {/if}
            </div>
        </div>
    </form>
</div>

<style>
    #formPass{
        max-width: 750px;
        margin: 0 auto;
    }

    .formLabel{
        margin-left: 1px;
        margin-top: 10px;
    }
</style>