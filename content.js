class BaseItem {
  constructor(classList, addToBody = true) {
    this.div = document.createElement("div");
    this.div.classList.add(...classList);
    if (addToBody) document.body.appendChild(this.div);
  }

  addItem(item) {
    this.div.appendChild(item.div); // Append the provided item's div to this div
  }

  removeAllClasses() {
    this.div.className = ""; // Set className to an empty string
  }
}

class Camera extends BaseItem {
  constructor(classList, chiikawaInstance, addToBody = true) {
    super(classList, addToBody);
    this.chiikawa = chiikawaInstance; // Store the chiikawa instance
    this.cameraClicked = false;
    this.init();
  }

  init() {
    this.div.addEventListener("mousedown", this.handleMouseDown.bind(this));
  }

  CameraAnimation() {
    // const cameraSound = new Audio(
    //   chrome.runtime.getURL("audio/camera_click.mp3")
    // );
    // //cameraSound.volume = this.setVolume;
    // cameraSound.play().catch((error) => {
    //   console.error("Error playing sound:", error);
    // });
    const blink = document.createElement("div");
    blink.classList.add("blink");
    this.div.appendChild(blink);
  }

  handleMouseDown() {
    if (this.cameraClicked) return;
    this.cameraClicked = true;
    this.div.style.cursor = "default";
    this.CameraAnimation();
    if (!this.chiikawa.walking) {
      const checkWalkingInterval = setInterval(() => {
        if (this.chiikawa.walking) {
          this.chiikawa.ChiikawaDisappear();
          clearInterval(checkWalkingInterval);
        }
      }, 100);
    } else {
      this.chiikawa.ChiikawaDisappear();
    }
  }
}

class Chiikawa extends BaseItem {
  constructor() {
    super(["rest"]); // Call the parent constructor with the initial class
    this.div.style.position = "fixed";
    this.div.style.bottom = "0";
    this.div.style.zIndex = "1000";
    this.div.style.transition = "transform 0.5s";
    this.petWidth = 40; // Width of the pet in pixels
    this.petHeight = 60; // Height of the pet in pixels
    this.actions = {
      rest: 2000, // Duration in milliseconds
      dance: 3500, // Duration in milliseconds
      sing: 1000,
    };
    this.actionKeys = Object.keys(this.actions);
    this.chosenActions = this.actionKeys[0];
    this.actionDuration = this.actions[this.chosenActions];
    this.x = Math.random() * (window.innerWidth - this.petWidth);
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.walking = false;
    this.maxWalkDuration = 10000;
    this.minWalkDuration = 5000;
    this.isDragging = false;
    this.isFalling = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.setVolume = 0.5;

    this.init();
  }

  init() {
    this.div.style.left = `${this.x}px`;
    this.div.style.bottom = "0px";

    // Start the pet behavior loop
    requestAnimationFrame(this.updatePet.bind(this));
    setTimeout(this.startWalking.bind(this), this.actionDuration); // Start the first walk after initial rest

    // Add resize event listener
    window.addEventListener("resize", this.handleResize.bind(this));

    // Add drag functionality
    this.div.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  isWalking() {
    return this.walking;
  }

  updatePet() {
    if (!this.isDragging && !this.isFalling && this.walking) {
      const speed = Math.random() * 0.5; // Random speed between 0 and 0.5 pixels per frame
      this.x += speed * this.direction;

      // Change direction if the pet hits the edge of the screen
      if (this.x < 0 || this.x > window.innerWidth - this.petWidth) {
        this.direction *= -1; // Reverse direction
        // Ensure the pet stays within the window
        this.x = Math.max(
          0,
          Math.min(this.x, window.innerWidth - this.petWidth)
        );
        this.updateDirectionClass();
      }

      this.div.style.left = `${this.x}px`;
    }
    requestAnimationFrame(this.updatePet.bind(this));
  }

  updateDirectionClass() {
    if (this.direction === 1) {
      this.div.classList.remove("left");
      this.div.classList.add("right");
    } else {
      this.div.classList.remove("right");
      this.div.classList.add("left");
    }
  }

  startWalking() {
    if (this.isDragging || this.isFalling) return;
    this.walking = true;
    this.removeAllClasses();
    this.div.classList.add("walk");

    // Rethink direction randomly before starting to walk
    this.direction = Math.random() < 0.5 ? -1 : 1; // Randomly set direction
    this.updateDirectionClass(); // Update the class based on the new direction

    const walkDuration =
      Math.random() * (this.maxWalkDuration - this.minWalkDuration) +
      this.minWalkDuration;
    setTimeout(this.stopWalking.bind(this), walkDuration);
  }

  stopWalking() {
    if (this.isDragging || this.isFalling) return;
    this.walking = false;
    this.chosenActions =
      this.actionKeys[Math.floor(Math.random() * this.actionKeys.length)];
    this.removeAllClasses();
    this.div.classList.add(this.chosenActions);
    this.actionDuration = this.actions[this.chosenActions];
    setTimeout(this.startWalking.bind(this), this.actionDuration); // Start walking after resting
  }

  handleResize() {
    this.x = Math.min(this.x, window.innerWidth - this.petWidth);
  }

  handleMouseDown(e) {
    if (!this.walking) return;
    this.isDragging = true;
    this.walking = false;
    this.removeAllClasses();
    this.div.classList.add("cry");
    const rect = this.div.getBoundingClientRect();
    this.dragOffsetX = e.clientX - rect.left;
    this.dragOffsetY = e.clientY - rect.top;
    this.div.style.transition = "none"; // Disable transition during drag
  }

  handleMouseMove(e) {
    if (this.isDragging) {
      this.x = Math.max(
        0,
        Math.min(
          e.clientX - this.dragOffsetX,
          window.innerWidth - this.petWidth
        )
      );
      const y = e.clientY - this.dragOffsetY;
      this.div.style.left = `${this.x}px`;
      this.div.style.bottom = `${Math.max(
        0,
        window.innerHeight - y - this.petHeight
      )}px`;
    }
  }

  handleMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.isFalling = true;

      // Calculate the distance to fall
      const petRect = this.div.getBoundingClientRect();
      const fallDistance = window.innerHeight - petRect.bottom; // Distance to the bottom of the window

      // Set a duration based on the fall distance (e.g., 0.5 seconds for 100 pixels)
      const duration = Math.min(fallDistance / 200, 1.25); // Example: 1 second max duration

      this.div.style.transition = `bottom ${duration}s cubic-bezier(0.5, 0, 1, 1)`; // Enable falling transition
      this.div.style.bottom = "0px"; // Make the pet fall to the bottom

      setTimeout(() => {
        this.isFalling = false;
        this.removeAllClasses();
        this.div.classList.add("ground");
        this.div.addEventListener(
          "animationend",
          this.handleGroundAnimationEnd.bind(this),
          {
            once: true,
          }
        );
      }, duration * 1000);
    }
  }

  handleGroundAnimationEnd() {
    this.removeAllClasses();
    this.div.classList.add("rest");
    this.div.style.transition = "";

    const restDuration = 2000;
    setTimeout(this.startWalking.bind(this), restDuration);
  }

  ChiikawaDisappear() {
    this.removeAllClasses();
    this.walking = false;
    this.div.classList.add("fade");
    this.div.addEventListener(
      "animationend",
      () => {
        this.div.style.display = "none";
      },
      { once: true }
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const chiikawa_bag = new BaseItem(["background-item", "chiikawa_bag"]);
  const chiikawa_weapon = new BaseItem(["background-item", "chiikawa_weapon"]);
  const chiikawa_camera = new BaseItem(["background-item", "chiikawa_camera"]);
  const chiikawa = new Chiikawa();
  const camera = new Camera(["camera"], chiikawa, false);
  const rack = new BaseItem(["rack"], false);
  chiikawa_camera.addItem(camera);
  chiikawa_camera.addItem(rack);
});
