// Obtaining the canvas element and setting it to the window dimensions
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Creating and initializing our Three.js scene
const sceneManager = new SceneManager(canvas);

// Set up listeners for DOM events
function bindEvents() {
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

function onWindowResize() {
    const screenDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    sceneManager.camera.aspect = screenDimensions.width / screenDimensions.height;
    sceneManager.camera.updateProjectionMatrix();
    sceneManager.renderer.setSize(screenDimensions.width, screenDimensions.height);
}

function onKeyDown(event) {
    let playerShip = sceneManager.gameObjects.playerShip;

    // Responding to input corresponding to the player
    playerShip.processInput(event.key);
}

function onKeyUp(event) { }

// Render loop
function render() {
    sceneManager.update();
    requestAnimationFrame(render);
}

// Performing actions
bindEvents();
render();