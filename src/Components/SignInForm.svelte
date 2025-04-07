<script>
    let showError = false
    async function userSignIn(e){
        const formData = new FormData(e.target)
        const data = {}
        for(let field of formData){
            const [key, value] = field
            data[key] = value
        }

        const res = await fetch('/user/signIn', {
            method: "POST", 
            credentials: 'same-origin',
            "body": JSON.stringify(data),
            headers:{
                'Content-Type':'application/json'
            }
        })
        const response = await res.json()
        if(response.success){
            window.location.href = "/"
        }
        else{
            showError = true
        }
    }
</script>

<form id="form" on:submit|preventDefault={userSignIn}>
    <div class="card bg-primary">
        <div class="card-body">
            <input type="text" placeholder="Email" class="input" name="email">
            <input type="password" placeholder="Password" class="input" id="inputPass" name="password">
            <button class="btn btn-neutral" id="signBtn" type="submit">Sign in</button>
            {#if showError}
            <p class="text-error font-bold text-l text-centre">Invalid login credentials</p>
            {/if}
        </div>
    </div>
</form>

<style>
    #inputPass{
        margin-top: 15px;
    }

    #signBtn{
        margin-top: 15px;
    }
</style>