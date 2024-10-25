function createSwitches(ids) {
  const container = document.getElementById("switch-container");
  ids.forEach((id) => {
    const displayName = id.replace(/_/g, " ");
    const switchHTML = `
    <div style="display: flex; justify-content: space-between;">
        <div class="switch">
          <input id="${id}" class="toggle-btn" type="checkbox" />
          <label for="${id}"></label>
        </div>
        <div style="align-self: center;">
            <p style="font-size: 14px; font-weight: 500;">${displayName}</p>
        </div>
        </div>
      `;
    container.insertAdjacentHTML("beforeend", switchHTML);

    const checkbox = document.getElementById(id);

    chrome.storage.local.get([id], (result) => {
      if (result[id] !== undefined) {
        checkbox.checked = result[id];
        if (checkbox.checked) {
          checkbox.classList.add("active");
        }
      }
    });

    checkbox.addEventListener("click", () => {
      if (checkbox.checked) {
        checkbox.classList.add("active");
      } else {
        checkbox.classList.remove("active");
      }

      chrome.storage.local.set({ [id]: checkbox.checked }, () => {
        console.log("successfully stored.");
      });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleElement",
          id: checkbox.id,
          checked: checkbox.checked,
        });
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const switchIds = [
    "chiikawa_bag",
    "chiikawa_weapon",
    "chiikawa_camera",
    "chiikawa",
  ];
  createSwitches(switchIds);
});
