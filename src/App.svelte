<script>
    let browser = navigator.userAgent
    let showFirefoxPopup = false
    if(browser.match(/chrome|chromium|crios/i)){
        showFirefoxPopup = true
    }
    //#region Imports
    import {Router, Route} from "svelte-routing"
	import FileForm from './Components/FileForm.svelte'
	import FileList from './Components/FileList.svelte'
    import NavBar from './Components/NavBar.svelte'
    import Footer from './Components/Footer.svelte'
    import SignInForm from './Components/SignInForm.svelte'
    import AdminPortal from './Components/AdminPortal.svelte'
    import CreateUserForm from './Components/CreateUserForm.svelte'
    import ChangePassword from './Components/ChangePassword.svelte'
    import PasswordReset from './Components/PasswordReset.svelte'
    import ChangePasswordAdmin from "./Components/ChangePasswordAdmin.svelte";
    import {io} from "socket.io-client"
    import { onDestroy, onMount } from "svelte";
    //#endregion

    let socket = io()
    let user_id
    let role_id

    onMount(async ()=>{
        const res = await fetch('/user/getUserInfo')
        const json = await res.json()
        user_id = json.user_id
        role_id = json.role_id
        updateScenarios()
    })

    let excelFileReady = [];
    let excelFileBusy = [];
    let excelFileSolved = [];
    let excelFileError = [];
    let excelFileQueue = []
    var login = checkUserSession();
    
    // Function that checks if their is a token set
    function checkUserSession(){
        let decodeCookie = decodeURIComponent(document.cookie)
        let array = decodeCookie.split(';')
        for(let i = 0; i < array.length; i++){
            let cookie = array[i]
            while(cookie.charAt(0) == ' '){
                cookie = cookie.substring(1)
            }
            if(cookie.indexOf('authcookie=') == 0){
                return true
            }
        }
        return false
    }

    let interval

    //excelFiles Socket session
    if(login){
        socket.on('receiveScenarios', (response)=>{
            excelFileReady = response.ready
            excelFileBusy = response.busy
            excelFileSolved = response.solved 
            excelFileError = response.error
            excelFileQueue = response.queue
        })

        socket.on('updateScenarios', ()=>{
            updateScenarios()
        })

        interval = setInterval(() => {
            updateScenarios()
        }, 3000);
        
    }
    function updateScenarios(){
        socket.emit('getScenarios', {user_id, role_id})
    }

    onDestroy(()=>{
        clearInterval(interval)
        socket.disconnect()
    })
</script>

<Router>
<div class="appContainer">
    
    {#if showFirefoxPopup}
        <div class="grid bg-primary rounded-lg my-3 p-1">
            <p class="text-center font-bold">The BGO Tool is currently having issues with all Chrome browsers. Please use the Firefox web browser to get better performance in the mean time.</p>
            <a href="https://www.mozilla.org/en-US/firefox/new/" target="_blank" rel="noreferrer" class="text-center underline underline-1">Click here to download Firefox</a>
        </div>
    {/if}
    
    <NavBar login={login}/>

    <Route path="/passwordReset">
        <PasswordReset />
    </Route>
    
    {#if !login}
    <div class="signInFormContainer">
        <SignInForm />
    </div>
    {:else}
    <main>
        <Route path="/">
        <div class="formContainer">
            <FileForm />
        </div>
        <div class="nContainer">
            <FileList 
                excelFileReady={excelFileReady}
                excelFileBusy={excelFileBusy}
                excelFileSolved={excelFileSolved}
                excelFileError={excelFileError}
                excelFileQueue={excelFileQueue}
            />   
        </div>
        </Route>
        <Route path="adminPortal">
            <div class="nContainer">
                <AdminPortal />
            </div>
        </Route>
        <Route path="createUser">
            <div class="nContainer">
                <CreateUserForm />
            </div>
        </Route>
        <Route path="changePassword">
            <div class="nContainer">
                <ChangePassword />
            </div>
        </Route>
        <Route path="changePasswordAdmin/:id">
            <div class="nContainer">
                <ChangePasswordAdmin />
            </div>
        </Route>
    </main>
    {/if}
</div>
<Footer />
</Router>

<style>
    .appContainer{
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 30px;
    }

    .formContainer{
        max-width: 750px;
        margin: 0 auto;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .signInFormContainer{
        max-width: 600px;
        margin: 0 auto;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .nContainer{
        max-width: 1000px;
        margin: 0 auto;
    }
</style>