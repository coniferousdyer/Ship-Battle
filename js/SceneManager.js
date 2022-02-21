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

    // Generate a random number between min and max
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Update the scene
    update() {
        // The condition is bit of a hack to ensure no errors pop up at the 
        // beginning.
        if (this.gameObjects.playerShip.model !== undefined) {
            // Update the game world
            this.gameObjects.world.update();

            // Update the enemies' movement
            if (this.gameObjects.enemyShips.length > 0) {
                this.gameObjects.enemyShips.forEach((enemyShip) => {
                    enemyShip.move(this.gameObjects.playerShip.model.position);
                });
            }

            // We ensure that the player ship is always in front of the camera
            if (this.gameObjects.playerShip.model !== undefined) {
                this.camera.lookAt(this.gameObjects.playerShip.model.position);
            }

            // Randomly generate enemies with a probability of 1 in 1000. We
            // place a limit of 5 enemies in the scene to reduce the amount of
            // computational load.
            if (this.gameObjects.enemyShips.length < 5 && this.randomNumber(0, 1000) < 1) {
                this.createEnemy();
            }

            this.renderer.render(this.scene, this.camera);
        }
    }

    // Create the scene objects
    createSceneObjects() {
        this.gameObjects.world = new World(this.scene, this.renderer);
        this.gameObjects.playerShip = new PlayerShip(this.scene, this.camera);

        // The following are the dynamic objects that are added to the scene.
        // We initialize them as empty arrays, and we can add and remove objects 
        // as required.
        this.gameObjects.playerBullets = [];
        this.gameObjects.enemyShips = [];
        this.gameObjects.enemyBullets = [];
        this.gameObjects.treasureChests = [];
    }

    // Create an enemy
    createEnemy() {
        let position = {};
        const playerShipPosition = this.gameObjects.playerShip.model.position;

        do {
            // Generate a random position for the enemy within a square area
            // of 250 x 250 around the player ship.
            position = {
                x: playerShipPosition.x + this.randomNumber(-250, 250),
                y: 2,
                z: playerShipPosition.z + this.randomNumber(-250, 250)
            };
        } while (position.x === playerShipPosition.x && position.z === playerShipPosition.z);

        const enemyShip = new EnemyShip(this.scene, position);
        this.gameObjects.enemyShips.push(enemyShip);
    }
}