<script>
  export let fileId;
  export let fileName;
  export let uploadedDateTime;
  export let scenarioCode;
  export let cardColour;
  export let demand;

  function downloadInput() {
    window.location.href = `/scenarios/downloadInput/${fileId}`;
  }

  async function dequeueScenario() {
    const res = await fetch(`/solver/dequeueSolver/${fileId}`, {
      method: "POST",
    });
    const result = await res.json();
    if (!result.success) {
      alert(`Error dequeuing scenario #${fileId}`);
    }
  }

  function dateFormat(datetime) {
    let date = datetime.split("T");
    date[1] = date[1].split(".");
    return date[0] + " " + date[1][0];
  }
</script>

<div class="card shadow-lg form-container p-3 mt-4 mb-1 {cardColour}">
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
        data-tip="Dequeue"
      >
        <button
          class="btn btn-sm btn-error btn-circle text-white"
          on:click={() => dequeueScenario()}
          ><i class="fas fa-minus"></i></button
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
</div>
