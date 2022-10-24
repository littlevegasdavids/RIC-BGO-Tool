<script>
import Cookie from "cookie-reader"
export let login;

const role_id = Cookie.getItem('role_id')
const pathName = window.location.pathname
function adminPortal(){
    
    if(pathName == "/adminPortal"){
        return true
    }
    return false

}

function showPasswordButton(){
    if(pathName == "/changePassword"){
        return false
    }
    return true
}

function hideButtonsPassReset(){
    if(pathName == "/passwordReset"){
        return true
    }
    return false
}

const greetings = [
    "Hello There",
    "Salutations", 
    "Top of the mornin'", 
    "In case I don't see ya, Good Afternoon, Good Evening & Good Night"
]
function getGreeting(){
    const num = Math.floor(Math.random() * greetings.length)
    //return greetings[num]
    return ""
}
</script>


<div class="navbar mb-2 shadow-lg bg-primary-content text-neutral-content rounded-box">
    <div class="px-2 mx-2 navbar-start">
        <p class="font-bold text-xs">{getGreeting()}</p>
    </div> 
    <div class="px-2 mx-2 navbar-center lg:flex">
        <h1 class="text-3xl font-bold text-white">
            BGO Tool
        </h1>
    </div> 
    <div class="navbar-end">
        {#if login && !hideButtonsPassReset()}
            <div class="dropdown dropdown-hover">
                <p tabindex="0" class="btn m-1">Menu<i class="fas fa-bars"></i></p>
                <ul tabindex ="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {#if role_id === "1" && !adminPortal()}
                        <li class="rounded-box btn-primary"><a href="/adminPortal">Admin portal<i class="fas fa-user-shield"></i></a></li>
                    {:else if role_id === "1" && adminPortal()}
                        <li class="rounded-box btn-warning mt-2"><a href="/">Scenario List<i class="fas fa-list"></i></a></li>
                    {/if}
                    {#if showPasswordButton()}
                        <li class="rounded-box btn-secondary mt-2"><a href="/changePassword">Change password<i class="fas fa-key"></i></a></li>
                    {/if}
                    <li class="rounded-box btn-error mt-2"><a href="/user/signOut">Logout<i class="fas fa-sign-out-alt"></i></a></li>
                </ul>
            </div>
        {/if}
    </div>
</div>


<style>
    i{
        padding-left: 5px;
    }
</style>