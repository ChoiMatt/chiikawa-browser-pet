console.log("Content script loaded");
document.addEventListener("DOMContentLoaded", () => {
  // Set CSS variables for background images
  document.documentElement.style.setProperty(
    "--bag-image",
    `url('${chrome.runtime.getURL("images/chiikawa_bag.png")}')`
  );
  document.documentElement.style.setProperty(
    "--weapon-image",
    `url('${chrome.runtime.getURL("images/chiikawa_weapon.png")}')`
  );

  const leftItem = document.createElement("div");
  leftItem.classList.add("background-item", "left-item");
  document.body.appendChild(leftItem);

  const rightItem = document.createElement("div");
  rightItem.classList.add("background-item", "right-item");
  document.body.appendChild(rightItem);

  const pet = document.createElement("div");
  pet.classList.add("ssh-pet", "rest");
  // Set the background images for different states
  pet.style.setProperty(
    "--rest-image",
    `url('${chrome.runtime.getURL("images/chiikawa_rest.png")}')`
  );
  pet.style.setProperty(
    "--smile-image",
    `url('${chrome.runtime.getURL("images/chiikawa_smile.png")}')`
  );
  pet.style.setProperty(
    "--walk-image-left",
    `url('${chrome.runtime.getURL("images/chiikawa_walk_left.png")}')`
  );
  pet.style.setProperty(
    "--walk-image-right",
    `url('${chrome.runtime.getURL("images/chiikawa_walk_right.png")}')`
  );
  pet.style.setProperty(
    "--dance-1-image",
    `url('${chrome.runtime.getURL("images/chiikawa_dance-1.png")}')`
  );
  pet.style.setProperty(
    "--cry-image",
    `url('${chrome.runtime.getURL("images/chiikawa_afraid.png")}')`
  );
  pet.style.setProperty(
    "--ground-image",
    `url('${chrome.runtime.getURL("images/chiikawa_ground.png")}')`
  );
  document.body.appendChild(pet);

  const petWidth = 40; // Width of the pet in pixels
  const petHeight = 60; // Height of the pet in pixels
  const actions = {
    rest: 2000, // Duration in seconds
    dance: 3500, // Duration in seconds
    sing: 1000, // Duration in seconds
  };
  const actionKeys = Object.keys(actions);
  let chosen_actions = actionKeys[0];
  let action_duration = actions[chosen_actions];
  let x = Math.random() * (window.innerWidth - petWidth);
  let direction = Math.random() < 0.5 ? -1 : 1; // Random initial direction
  let walking = false;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const minRestDuration = 4000; // Minimum rest duration of 7 seconds
  const maxRestDuration = 7000; // Maximum rest duration of 10 seconds
  const minWalkDuration = 3000; // Minimum walk duration of 3 seconds
  const maxWalkDuration = 5000; // Maximum walk duration of 5 seconds

  function updatePet() {
    if (!isDragging && walking) {
      const speed = Math.random() * 0.5; // Random speed between 0 and 0.5 pixels per frame
      x += speed * direction;

      // Change direction if the pet hits the edge of the screen
      if (x < 0 || x > window.innerWidth - petWidth) {
        direction *= -1; // Reverse direction
        // Ensure the pet stays within the window
        x = Math.max(0, Math.min(x, window.innerWidth - petWidth));

        // Update the animation direction
        updateDirectionClass();
      }

      pet.style.left = `${x}px`;
    }
    requestAnimationFrame(updatePet);
  }

  function updateDirectionClass() {
    if (direction === 1) {
      pet.classList.remove("left");
      pet.classList.add("right");
    } else {
      pet.classList.remove("right");
      pet.classList.add("left");
    }
  }

  function startWalking() {
    walking = true;
    pet.classList.remove(chosen_actions);
    pet.classList.add("walk");

    // Rethink direction randomly before starting to walk
    direction = Math.random() < 0.5 ? -1 : 1; // Randomly set direction
    updateDirectionClass(); // Update the class based on the new direction

    const walkDuration =
      Math.random() * (maxWalkDuration - minWalkDuration) + minWalkDuration;
    setTimeout(stopWalking, walkDuration);
  }

  function stopWalking() {
    walking = false;
    chosen_actions = actionKeys[Math.floor(Math.random() * actionKeys.length)];
    pet.classList.remove("walk", "left", "right");
    pet.classList.add(chosen_actions);
    action_duration = actions[chosen_actions];
    setTimeout(startWalking, action_duration); // Start walking after resting
  }

  // Set initial position at the bottom of the screen
  pet.style.left = `${x}px`;
  pet.style.bottom = "0px";

  // Start the pet behavior loop
  requestAnimationFrame(updatePet);
  // const initialRestDuration =
  //   Math.random() * (maxRestDuration - minRestDuration) + minRestDuration;
  setTimeout(startWalking, action_duration); // Start the first walk after initial rest

  // Add resize event listener
  window.addEventListener("resize", () => {
    // Ensure the pet stays within the window after resizing
    x = Math.min(x, window.innerWidth - petWidth);
    updateBackgroundItemsPosition();
  });

  // Add drag functionality
  const crySound = new Audio(chrome.runtime.getURL("audio/cry_sound.mp3"));
  crySound.volume = 1; // Adjust volume as needed (0.0 to 1.0)
  crySound.loop = true; // Enable looping

  pet.addEventListener("mousedown", (e) => {
    if (!walking) return;
    isDragging = true;
    pet.classList.remove("walk", "left", "right");
    pet.classList.add("cry");
    const rect = pet.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    pet.style.transition = "none"; // Disable transition during drag

    // Play cry sound
    crySound.currentTime = 0; // Reset sound to start
    crySound
      .play()
      .catch((error) => console.error("Error playing sound:", error));
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      x = Math.max(
        0,
        Math.min(e.clientX - dragOffsetX, window.innerWidth - petWidth)
      );
      const y = e.clientY - dragOffsetY;
      pet.style.left = `${x}px`;
      pet.style.bottom = `${Math.max(0, window.innerHeight - y - petHeight)}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      // pet.classList.remove("cry");
      // pet.classList.add("fall");

      // Stop cry sound
      crySound.pause();
      crySound.currentTime = 0;

      // Calculate the distance to fall
      const petRect = pet.getBoundingClientRect();
      const fallDistance = window.innerHeight - petRect.bottom; // Distance to the bottom of the window

      // Set a duration based on the fall distance (e.g., 0.5 seconds for 100 pixels)
      const duration = Math.min(fallDistance / 200, 1.25); // Example: 1 second max duration

      pet.style.transition = `bottom ${duration}s cubic-bezier(0.5, 0, 1, 1)`; // Enable falling transition
      pet.style.bottom = "0px"; // Make the pet fall to the bottom

      // After falling, change to ground class
      setTimeout(() => {
        pet.classList.remove("cry");
        pet.classList.add("ground");

        setTimeout(() => {
          pet.classList.remove("ground");
          pet.classList.add("rest");
          pet.style.transition = "";
          const restDuration =
            Math.random() * (maxRestDuration - minRestDuration) +
            minRestDuration;
          setTimeout(startWalking, restDuration);
        }, 2000);
        // pet.addEventListener(
        //   "animationend",
        //   () => {
        //     pet.classList.remove("ground");
        //     pet.classList.add("rest");
        //     pet.style.transition = "";
        //     const restDuration =
        //       Math.random() * (maxRestDuration - minRestDuration) +
        //       minRestDuration;
        //     setTimeout(startWalking, restDuration);
        //   },
        //   { once: true }
        // );
      }, duration * 1000); // Wait for the duration of the fall before changing to ground
    }
  });
});
