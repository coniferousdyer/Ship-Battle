class SceneManager {
    // Initialize the scene
    constructor(canvas) {
        const screenDimensions = {
            width: canvas.width,
            height: canvas.height
        };

        // The current scene
        this.scene = new THREE.Scene();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setClearColor(0x00FFFF);
        this.renderer.setSize(screenDimensions.width, screenDimensions.height);

        // Camera
        this.camera = new THREE.PerspectiveCamera(-screenDimensions.width / 2, screenDimensions.width / screenDimensions.height, 0.1, 1000);
        this.camera.position.set(0, 2, 3);

        const ambientLight = new THREE.AmbientLight('#FFFFFF', 1.5);
        this.scene.add(ambientLight);

        // Creating scene objects
        this.gameObjects = {};
        this.createSceneObjects();
    }

    // Update the scene
    update() {
        for (let key in this.gameObjects) {
            this.gameObjects[key].update();
        }

        // The condition is bit of a hack to ensure no errors pop up at the 
        // beginning. Here,  we ensure that the player ship is always in front 
        // of the camera.
        if (this.gameObjects.playerShip.model !== undefined) {
            this.camera.lookAt(this.gameObjects.playerShip.model.position);
        }

        this.renderer.render(this.scene, this.camera);
    }

    // Create the scene objects
    createSceneObjects() {
        this.gameObjects.world = new World(this.scene, this.renderer);
        this.gameObjects.playerShip = new PlayerShip(this.scene, this.camera);
    }
}