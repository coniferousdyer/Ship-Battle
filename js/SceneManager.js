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
        this.camera.position.set(0, 10, 1);

        const ambientLight = new THREE.AmbientLight('#ffffff', 1.5);
        this.scene.add(ambientLight);

        // Creating scene objects
        this.gameObjects = [];
        this.createSceneObjects();
    }

    // Update the scene
    update() {
        for (let obj of this.gameObjects) {
            obj.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    // Create the scene objects
    createSceneObjects() {
        const world = new World(this.scene, this.renderer);
        const playerShip = new PlayerShip(this.scene);

        this.gameObjects.push(world);
        this.gameObjects.push(playerShip);
    }
}