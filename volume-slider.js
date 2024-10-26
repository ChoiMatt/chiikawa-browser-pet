function createVolumeSlider() {
  const container = document.getElementById("volume-slider-container");
  const sliderHTML = `
    <div class="volume-slider">
      <label for="volume" class="volume-label">Volume :</label>
      <input type="range" id="volume" class="volume-input" min="0" max="100" value="50" />
    </div>
  `;
  container.insertAdjacentHTML("beforeend", sliderHTML);

  const volumeInput = document.getElementById("volume");

  chrome.storage.local.get(["volume"], (result) => {
    if (result.volume !== undefined) {
      volumeInput.value = result.volume;
    }
  });

  volumeInput.addEventListener("input", () => {
    const volume = volumeInput.value;
    chrome.storage.local.set({ volume: volume }, () => {
      console.log(`Volume state saved: ${volume}`);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "setVolume",
        volume: volume,
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  createVolumeSlider();
});
