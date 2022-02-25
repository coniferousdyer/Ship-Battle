// Obtaining the canvas element and setting it to the window dimensions
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Creating and initializing our Three.js scene
const sceneManager = new SceneManager(canvas);

// Keep track of the starting time so that we can calculate the time passed
let startTime = Date.now();

// Check if the keydown event listener has been added
let keyDownEventListenerActive = true;

// Set up listeners for DOM events
function bindEvents() {
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("keydown", onKeyDown);
}

// Resize the canvas when the window is resized
function onWindowResize() {
    const screenDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    sceneManager.camera.aspect = screenDimensions.width / screenDimensions.height;
    sceneManager.camera.updateProjectionMatrix();
    sceneManager.renderer.setSize(screenDimensions.width, screenDimensions.height);
}

// Keydown event handler
function onKeyDown(event) {
    if (event.key === "1") {
        sceneManager.cameraView = 0;
    } else if (event.key === "2") {
        sceneManager.cameraView = 1;
    } else {
        // Responding to input corresponding to the player
        let playerShip = sceneManager.gameObjects.playerShip;
        playerShip.processInput(event.key);
    }
}

// Function to update the statistics of the game
function updateHUD() {
    const playerShip = sceneManager.gameObjects.playerShip;

    if (playerShip.model !== undefined) {
        let treasureCollected = document.getElementById("treasure-collected");
        let shipsDestroyed = document.getElementById("ships-destroyed");
        let health = document.getElementById("health");
        let time = document.getElementById("time");

        treasureCollected.innerHTML = "Treasure Collected: " + playerShip.treasureCollected.toString();
        shipsDestroyed.innerHTML = "Ships Destroyed: " + playerShip.shipsDestroyed.toString();
        health.innerHTML = "Health: " + playerShip.health.toString();
        time.innerHTML = "Time Passed: " + ((Date.now() - startTime) / 1000).toString();
    }
}

// Render loop
function render() {
    sceneManager.update();

    // Update the HUD
    updateHUD();

    // If the game is over, remove the keydown event listener
    if (sceneManager.gameState === 1 && keyDownEventListenerActive) {
        window.removeEventListener("keydown", onKeyDown);
        keyDownEventListenerActive = false;
    }

    requestAnimationFrame(render);
}

// Performing actions
bindEvents();
render();