<script>
  import { onDestroy, onMount } from "svelte";
  import { show_kill_solver_popup } from "../../Stores/kill_solver_popup";

  export let fileId;
  export let fileName;
  export let uploadedDateTime;
  export let scenarioCode;
  export let demand;

  let solverFeedback = "";
  let textArea;
  import { io } from "socket.io-client";
  let socket = io();
  onMount(() => {
    if (textArea != null) {
      socket.on("solverFeedback", (text) => {
        solverFeedback += text;
        textArea.scrollTop = textArea.scrollHeight;
      });
    }
  });

  function downloadInput() {
    window.location.href = `/scenarios/downloadInput/${fileId}`;
  }

  async function killSolver() {
    const text = `Are you sure you want to kill scenario ${fileId} while busy solving ?`;
    if (confirm(text)) {
      $show_kill_solver_popup = true;
      const res = await fetch(`/solver/killSolver/${fileId}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (result.success) {
        window.location.href = "/error";
      } else {
        alert("Error stopping scenario");
      }
    }
  }

  function dateFormat(datetime) {
    let date = datetime.split("T");
    date[1] = date[1].split(".");
    return date[0] + " " + date[1][0];
  }

  onDestroy(() => {
    socket.disconnect();
  });
</script>

<div class="card shadow-lg form-container p-3 mt-4 mb-1 bg-base-100">
  <div class="grid grid-cols-2 justify-items-stretch">
    <div class="justify-self-start">
      <h1 class="text-xl font-bold">
        #{fileId} - {scenarioCode}
      </h1>
    </div>
    <div class="justify-self-end">
      <div
        class="tooltip tooltip-bottom font-bold ml-3"
        data-tip="Download Input File"
      >
        <button
          class="btn btn-sm btn-circle btn-warning text-white"
          on:click={() => downloadInput()}
          ><i class="fas fa-file-download"></i></button
        >
      </div>

      <div
        class="tooltip tooltip-bottom font-bold ml-3 mr-3"
        data-tip="Kill Solver"
      >
        <button
          class="btn btn-sm btn-error btn-circle text-white"
          on:click={() => killSolver()}><i class="fas fa-skull"></i></button
        >
      </div>
    </div>
  </div>
  <div class="grid grid-cols-2 mt-2 text">
    <span class="text-sm">
      File Name : {fileName}
    </span>
    <div class="grid justify-items-end">
      <span class="text-sm">
        Upload Date & Time : {dateFormat(uploadedDateTime)} (UTC)
      </span>
    </div>
  </div>
  <div class="grid grid-cols-2">
    <span class="pt-1 text-sm">
      Demand: {demand}M
    </span>
  </div>

  <div class="grid grid-cols-1 justify-items-center">
    <h1 class="text-xl font-bold mt-5">Solver Feedback</h1>
    <textarea
      class="mt-2 pl-3 border" 
      value={solverFeedback}
      bind:this={textArea}
      disabled
    ></textarea>
  </div>
</div>

<style>
  textarea {
    width: 75%;
    height: 150px;
  }
</style>
