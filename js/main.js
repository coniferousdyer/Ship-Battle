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
    let camera = sceneManager.camera;

    // Responding to input corresponding to the player
    playerShip.processInput(event.key);

    // Adjusting the camera to look at the player
    const relativeCameraOffset = new THREE.Vector3(0, 1.5, 3.5);
    const cameraOffset = relativeCameraOffset.applyMatrix4(playerShip.model.matrixWorld);
    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt(playerShip.model.position);
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