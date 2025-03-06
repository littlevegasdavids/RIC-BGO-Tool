<script>
  import { show_upload_scenario_pop_up } from "../Stores/upload_scenario_popup";
  import Upload_Scenario_Popup from "../Components/Popups/Upload_Scenario_Popup.svelte";
  let showErrorMsg = false;
  let excelFile;
  let submitBtn;

  $: {
    //submitBtn.disabled = true
    showErrorMsg = false;
    if (excelFile) {
      if (excelFile.length != 0) {
        // File extension
        const ext = excelFile[0].name.split(".").pop();
        //File size in mb
        const fileSize = excelFile[0].size / 100000;
        if (ext === "xlsx") {
          submitBtn.disabled = false;
        } else {
          showErrorMsg = true;
          submitBtn.disabled = true;
        }
      } else {
        submitBtn.disabled = true;
      }
    }
  }
  function downloadTemplate() {
    window.location.href = "/scenarios/downloadTemplate";
  }

  function disableBtn() {
    $show_upload_scenario_pop_up = true;
    submitBtn.disabled = true;
  }
</script>

{#if showErrorMsg}
  <p class="text-error">Invalid file input</p>
{/if}
<form
  action="/scenarios/uploadScenario"
  id="uploadForm"
  method="post"
  enctype="multipart/form-data"
  on:submit={disableBtn}
>
  <div class="flex flex-col justify-center items-center mb-3">
    <div
      class="shadow-lg form-container bg-warning text-black max-w-3xl rounded-xl p-5"
    >
      <span class="font-bold text-lg underline">Upload scenario</span><br />
      <input
        type="file"
        name="excelFile"
        id="excelFile"
        accept=".xlsx"
        class=""
        bind:files={excelFile}
      />
      <button
        type="submit"
        id="submitBtn"
        class="btn btn-primary"
        disabled
        bind:this={submitBtn}
      >
        Upload File<i class="fas fa-file-upload"></i>
      </button>
      <button
        type="button"
        class="btn btn-white ml-3"
        on:click={downloadTemplate}
      >
        Download template file<i class="fas fa-file-download"></i>
      </button>
    </div>
  </div>
</form>

{#if $show_upload_scenario_pop_up}
  <Upload_Scenario_Popup />
{/if}

<style>
  i {
    padding-left: 5px;
  }

  .form-container {
    margin: 5px;
  }
</style>
