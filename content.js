class BaseItem {
  constructor(classList, addToBody = true) {
    this.div = document.createElement("div");
    this.div.classList.add(...classList);
    if (addToBody) document.body.appendChild(this.div);
  }

  addItem(item) {
    this.div.appendChild(item.div);
  }

  removeAllClasses() {
    this.div.className = "";
  }
}

class Camera extends BaseItem {
  constructor(classList, chiikawaInstance, addToBody = true) {
    super(classList, addToBody);
    this.chiikawa = chiikawaInstance;
    this.cameraClicked = false;
    this.init();
  }

  init() {
    this.div.addEventListener("mousedown", this.handleMouseDown.bind(this));
  }

  CameraAnimation() {
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
    super([]);
    this.div.id = "chiikawa";
    this.div.style.position = "fixed";
    this.div.style.bottom = "0";
    this.div.style.zIndex = "1000";
    this.div.style.transition = "transform 0.5s";
    this.petWidth = 40;
    this.petHeight = 60;
    this.actions = {
      rest: 3000,
      dance: 4000,
      think: 5000,
    };
    this.actionKeys = Object.keys(this.actions);
    this.chosenActions = this.actionKeys[0];
    this.actionDuration = this.actions[this.chosenActions];
    this.x = Math.random() * (window.innerWidth - this.petWidth);
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.walking = false;
    this.maxWalkDuration = 20000;
    this.minWalkDuration = 10000;
    this.isDragging = false;
    this.isFalling = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.setVolume = 0.5;
    this.thoughtBubble = null;

    this.init();
  }

  init() {
    this.div.style.left = `${this.x}px`;
    this.div.style.bottom = "0px";

    this.thoughtBubble = document.createElement("div");
    this.thoughtBubble.classList.add("thought-bubble");
    this.div.appendChild(this.thoughtBubble);

    this.div.classList.add(this.chosenActions);
    requestAnimationFrame(this.updatePet.bind(this));
    setTimeout(this.startWalking.bind(this), this.actionDuration);

    window.addEventListener("resize", this.handleResize.bind(this));

    this.div.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  isWalking() {
    return this.walking;
  }

  updatePet() {
    if (!this.isDragging && !this.isFalling && this.walking) {
      const speed = Math.random() * 0.5;
      this.x += speed * this.direction;

      if (this.x < 0 || this.x > window.innerWidth - this.petWidth) {
        this.direction *= -1;

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

    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.updateDirectionClass();

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

    if (this.thoughtBubble) {
      if (this.chosenActions === "think") {
        this.thoughtBubble.style.animation = "none";
        void this.thoughtBubble.offsetWidth;
        this.thoughtBubble.style.animation = "ssh-pet-thought-bubble 5s steps(21) forwards";
      } 
    }
    setTimeout(this.startWalking.bind(this), this.actionDuration);
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
    this.div.style.transition = "none";
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

      const petRect = this.div.getBoundingClientRect();
      const fallDistance = window.innerHeight - petRect.bottom;

      // Set a duration based on the fall distance (e.g., 0.5 seconds for 100 pixels)
      const duration = Math.min(fallDistance / 200, 1.25); // Example: 1 second max duration

      this.div.style.transition = `bottom ${duration}s cubic-bezier(0.5, 0, 1, 1)`;
      this.div.style.bottom = "0px";

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
        this.div.classList.add("hide");
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

  const elements = ["chiikawa_bag", "chiikawa_weapon", "chiikawa_camera", "chiikawa"];
  chrome.storage.local.get(elements, (result) => {
    elements.forEach(id => {
      let display_style = "block";
      if (result[id] !== undefined && result[id]) {
        let element;
        if (id === "chiikawa") {
          element = document.querySelector(`#${id}`);
        } else {
          if (id === "chiikawa_camera") display_style = "flex";
          element = document.querySelector(`.${id}`);
        }
        if (element) {
          element.style.display = "none";
        }
      }
    });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleElement") {
      let element;
      let display_style = "block";
      if (request.id === "chiikawa") {
        element = document.querySelector(`#${request.id}`);
      } else {
        if (request.id === "chiikawa_camera") display_style = "flex";
        element = document.querySelector(`.${request.id}`);
      }
      if (request.checked) {
        element.style.display = "none";
      } else if (!request.checked) {
        element.style.display = display_style;
      }
    }
  });
});
