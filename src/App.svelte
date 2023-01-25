<script>
    //#region Imports
    import {Router, Route} from "svelte-routing"
    import NavBar from './Components/NavBar.svelte'
    import Footer from './Components/Footer.svelte'
    import SignInForm from './Components/SignInForm.svelte'
    import AdminPortal from './Components/AdminPortal.svelte'
    import CreateUserForm from './Components/CreateUserForm.svelte'
    import ChangePassword from './Components/ChangePassword.svelte'
    import PasswordReset from './Components/PasswordReset.svelte'
    import ChangePasswordAdmin from "./Components/ChangePasswordAdmin.svelte";
    import SolvedScenarios from "./Components/Scenarios/SolvedScenarios.svelte"
    import ReadyScenarios from "./Components/Scenarios/ReadyScenarios.svelte";
    import ErrorScenarios from "./Components/Scenarios/ErrorScenarios.svelte";
    import QueueScenarios from "./Components/Scenarios/QueueScenarios.svelte";
    //#endregion

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
</script>

<Router>
<div class="appContainer">
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
            <ReadyScenarios />
        </Route>

        <Route path="/solved">
            <SolvedScenarios/>
        </Route>

        <Route path="/error">
            <ErrorScenarios/>
        </Route>

        <Route path="/queue">
            <QueueScenarios/>
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