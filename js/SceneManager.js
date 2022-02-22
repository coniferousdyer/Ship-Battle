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

        // Keeping track of the number of iterations
        this.iterations = 0;
    }

    // Generate a random number between min and max
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Update the scene
    update() {
        this.iterations = (this.iterations + 1) % 200;

        // The condition is bit of a hack to ensure no errors pop up at the 
        // beginning.
        if (this.gameObjects.playerShip.model !== undefined) {
            // Update the game world
            this.gameObjects.world.update();

            // Update the player ship
            this.gameObjects.playerShip.updateBullets();

            // Update the enemies' movement and bullets
            if (this.gameObjects.enemyShips.length > 0) {
                this.gameObjects.enemyShips.forEach((enemyShip) => {
                    if (enemyShip.model !== undefined) {
                        // Update the enemy's movement
                        enemyShip.move(this.gameObjects.playerShip.model.position);

                        // Shoot a bullet if the enemy is within a certain distance of the player.
                        // Bullets are fired once every 200 iterations.
                        const playerShipPosition = this.gameObjects.playerShip.model.position;
                        const enemyShipPosition = enemyShip.model.position;
                        if (Math.abs(playerShipPosition.x - enemyShipPosition.x) < 50 && Math.abs(playerShipPosition.z - enemyShipPosition.z) < 50) {
                            if (this.iterations === 0) {
                                enemyShip.shoot();
                            }
                        }

                        // Update existing bullets' movement
                        enemyShip.updateBullets();
                    }
                });
            }

            // Check for collisions
            this.checkPlayerEnemyCollisions();
            this.checkPlayerTreasureCollisions();

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

            // We do the same as above for treasure chests
            if (this.gameObjects.treasureChests.length < 5 && this.randomNumber(0, 1000) < 1) {
                this.createTreasureChest();
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
        this.gameObjects.enemyShips = [];
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
            // TODO: Make it a range
        } while (position.x === playerShipPosition.x && position.z === playerShipPosition.z);

        const enemyShip = new EnemyShip(this.scene, position);
        this.gameObjects.enemyShips.push(enemyShip);
    }

    // Create a treasure chest
    createTreasureChest() {
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
            // TODO: Make it a range
        } while (position.x === playerShipPosition.x && position.z === playerShipPosition.z);

        const treasureChest = new TreasureChest(this.scene, position);
        this.gameObjects.treasureChests.push(treasureChest);
    }

    // Check if a collision has occurred between any two objects
    isCollision(object1, object2) {
        if (object1.model === undefined || object2.model === undefined) {
            return false;
        }

        if (object1.model.position.distanceTo(object2.model.position) < 5) {
            return true;
        }

        return false;
    }

    // Check if a collision has occurred between the player ship and an enemy or their bullets
    checkPlayerEnemyCollisions() {
        if (this.gameObjects.playerShip.model !== undefined) {
            this.gameObjects.enemyShips.forEach((enemyShip) => {
                if (enemyShip.model !== undefined) {
                    // Player bullet hit enemy
                    this.gameObjects.playerShip.bullets.forEach((bullet) => {
                        if (this.isCollision(enemyShip, bullet)) {
                            enemyShip.receiveHit();
                            
                            // Increase player score and remove enemy from the enemy ship array
                            if (enemyShip.health <= 0) {
                                this.gameObjects.enemyShips.splice(this.gameObjects.enemyShips.indexOf(enemyShip), 1);
                                this.gameObjects.playerShip.destroyShip();
                            }

                            // Remove the bullet from the scene and the player's bullet array
                            bullet.destroy();
                            this.gameObjects.playerShip.bullets.splice(this.gameObjects.playerShip.bullets.indexOf(bullet), 1);
                        }
                    });

                    // Enemy bullet hit player
                    enemyShip.bullets.forEach((bullet) => {
                        if (this.isCollision(this.gameObjects.playerShip, bullet)) {
                            this.gameObjects.playerShip.receiveHit();
                            
                            // TODO: Add an exit condition
                            
                            // Remove the bullet from the scene and the enemy's bullet array
                            bullet.destroy();
                            enemyShip.bullets.splice(enemyShip.bullets.indexOf(bullet), 1);
                        }
                    });

                    // Player ship hit enemy TODO
                    // if (this.isCollision(this.gameObjects.playerShip, enemyShip)) {
                    //     this.gameObjects.playerShip.receiveHit();
                    //     enemyShip.receiveHit();
                    // }
                }
            });
        }
    }

    // Check if a collision has occurred between the player ship and a treasure chest
    checkPlayerTreasureCollisions() {
        if (this.gameObjects.playerShip.model !== undefined) {
            this.gameObjects.treasureChests.forEach((treasureChest) => {
                if (treasureChest.model !== undefined) {
                    if (this.isCollision(this.gameObjects.playerShip, treasureChest)) {
                        // Increase player score
                        this.gameObjects.playerShip.collectTreasure();

                        // Remove the treasure chest from the scene and the treasure chest array
                        treasureChest.destroy();
                        this.gameObjects.treasureChests.splice(this.gameObjects.treasureChests.indexOf(treasureChest), 1);
                    }
                }
            });
        }
    }
}

// TODO: Make plane infinite
// TODO: Use distanceTo wherever needed
// TODO: Change models