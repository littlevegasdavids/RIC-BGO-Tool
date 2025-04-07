<script>
  import Cookie from "cookie-reader";
  export let login;

  const role_id = Cookie.getItem("role_id");
  const pathName = window.location.pathname;
  function adminPortal() {
    if (pathName == "/adminPortal") {
      return true;
    }
    return false;
  }

  function showPasswordButton() {
    if (pathName == "/changePassword") {
      return false;
    }
    return true;
  }

  function hideButtonsPassReset() {
    if (pathName == "/passwordReset") {
      return true;
    }
    return false;
  }
</script>

<div class="navbar mt-5 shadow-lg bg-base-content rounded-box text-white max-w-5xl mx-auto">
  <div class="navbar-start"></div>
  <div class="navbar-center lg:flex">
    <h1 class="text-3xl font-bold">BGO Tool</h1>
  </div>
  <div class="navbar-end">
    {#if login && !hideButtonsPassReset()}
      <div class="dropdown dropdown-hover dropdown-end z-10">
        <p class="btn m-1">Menu<i class="fas fa-bars"></i></p>
        <ul
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 flex gap-2"
        >
          {#if role_id === "1" && !adminPortal()}
            <li class="rounded-box bg-primary">
              <a href="/adminPortal"
                >Admin portal<i class="fas fa-user-shield"></i></a
              >
            </li>
          {:else if role_id === "1" && adminPortal()}
            <li class="rounded-box bg-warning">
              <a href="/">Scenario List<i class="fas fa-list"></i></a>
            </li>
          {/if}
          {#if showPasswordButton()}
            <li class="rounded-box bg-secondary">
              <a href="/changePassword"
                >Change password<i class="fas fa-key"></i></a
              >
            </li>
          {/if}
          <li class="rounded-box bg-error">
            <a href="/user/signOut">Logout<i class="fas fa-sign-out-alt"></i></a
            >
          </li>
        </ul>
      </div>
    {/if}
  </div>
</div>
