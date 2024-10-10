function createSwitches(ids) {
  const container = document.getElementById("switch-container");
  ids.forEach((id) => {
    const displayName = id.replace(/_/g, " ");
    const switchHTML = `
    <div style="display: flex; justify-content: space-between;">
        <div class="switch">
          <input id="${id}" class="look" type="checkbox" />
          <label for="${id}"></label>
        </div>
        <div>
            <p style="font-size: 14px; font-weight: 500;">${displayName}</p>
        </div>
        </div>
      `;
    container.insertAdjacentHTML("beforeend", switchHTML);

    // Add onclick listener to the input
    const checkbox = document.getElementById(id); // Get the checkbox by its ID
    checkbox.addEventListener("click", () => {});
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
