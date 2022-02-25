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

        const light = new THREE.DirectionalLight(0x404040, 10);
        this.scene.add(light);

        // Audio
        const listener = new THREE.AudioListener();
        this.camera.add(listener);
        this.sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../assets/sounds/music.mp3', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(0.5);
            this.sound.play();
        });

        // Creating scene objects
        this.gameObjects = {};
        this.createSceneObjects();

        // Keeping track of the number of iterations
        this.iterations = 0;

        // A variable to keep track of the current camera view.
        // 0 = third-person view, 1 = bird's-eye view
        this.cameraView = 0;

        // A variable to keep track of the current game state
        // 0 = playing, 1 = game over
        this.gameState = 0;

        // The final position of the player ship before game is over
        this.finalPlayerPosition = new THREE.Vector3(0, 0, 0);
    }

    // Generate a random number between min and max
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Update the scene
    update() {
        // If the game has ended, do not update the scene, only update the camera position
        // to give a zoom-out effect.
        if (this.gameState === 1) {
            if (this.camera.position.distanceTo(this.finalPlayerPosition) <= 500) {
                this.camera.position.x += 0.5;
                this.camera.position.y += 0.5;
                this.camera.rotation.y += 0.1;
            }

            this.camera.lookAt(this.finalPlayerPosition);
            this.renderer.render(this.scene, this.camera);

            return;
        }

        this.iterations = (this.iterations + 1) % 200;

        // The condition is bit of a hack to ensure no errors pop up at the 
        // beginning.
        if (this.gameObjects.playerShip.model !== undefined) {
            // Update the game world
            this.gameObjects.world.update();

            // Update the player ship
            this.gameObjects.playerShip.updateBullets();

            // Update the enemies' movement and bullets
            this.updateEnemyShips();

            // Check for collisions with enemies
            this.checkPlayerEnemyCollisions();

            // Update explosions
            this.updateExplosions();

            // If the game ended
            if (this.gameState === 1) {
                return;
            }

            // Check for collisions with treasure chests
            this.checkPlayerTreasureCollisions();

            // Destroy far away bullets
            this.destroyFarAwayBullets();

            // Adjust the camera to follow the player ship
            this.adjustCamera();

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
        this.gameObjects.explosions = [];
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

    // Update the enemies' movement and bullets
    updateEnemyShips() {
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
    }

    // Update explosions
    updateExplosions() {
        this.gameObjects.explosions.forEach((explosion) => {
            explosion.update();
            if (explosion.time >= 10) {
                explosion.destroy();
                this.gameObjects.explosions.splice(this.gameObjects.explosions.indexOf(explosion), 1);
            }
        });
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
                                // Create a bigger explosion
                                const explosion = new Explosion(this.scene, enemyShip.model.position, 5);
                                this.gameObjects.explosions.push(explosion);

                                this.gameObjects.enemyShips.splice(this.gameObjects.enemyShips.indexOf(enemyShip), 1);
                                this.gameObjects.playerShip.destroyEnemyShip();
                            } else {
                                // Create a smaller explosion
                                const explosion = new Explosion(this.scene, enemyShip.model.position, 1);
                                this.gameObjects.explosions.push(explosion);
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

                            // This is the end of the game
                            if (this.gameObjects.playerShip.health <= 0) {
                                // Create a bigger explosion
                                const explosion = new Explosion(this.scene, this.gameObjects.playerShip.model.position, 5);
                                this.gameObjects.explosions.push(explosion);

                                // Display the game over screen and add sound effects
                                const gameOver = document.getElementById('game-over');
                                const gameOverAudio = document.getElementById('game-over-audio');
                                gameOver.innerHTML = "GAME OVER";
                                this.sound.stop();
                                gameOverAudio.play();

                                // Set the game state to 'game over'
                                this.gameState = 1;

                                // Storing the final position and destroying the player ship
                                this.finalPlayerPosition = this.gameObjects.playerShip.model.position;
                                this.gameObjects.playerShip.destroy();
                            } else {
                                // Create a smaller explosion
                                const explosion = new Explosion(this.scene, this.gameObjects.playerShip.model.position, 1);
                                this.gameObjects.explosions.push(explosion);
                            }

                            // Remove the bullet from the scene and the enemy's bullet array
                            bullet.destroy();
                            enemyShip.bullets.splice(enemyShip.bullets.indexOf(bullet), 1);

                            // If game has ended, break out of the loop
                            if (this.gameState === 1) {
                                return;
                            }
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

                        // Add a sound effect
                        const audio = document.getElementById('treasure-audio');
                        audio.play();

                        // Remove the treasure chest from the scene and the treasure chest array
                        treasureChest.destroy();
                        this.gameObjects.treasureChests.splice(this.gameObjects.treasureChests.indexOf(treasureChest), 1);
                    }
                }
            });
        }
    }

    // Destroy far away bullets
    destroyFarAwayBullets() {
        // Player bullets
        this.gameObjects.playerShip.bullets.forEach((bullet) => {
            if (bullet.model !== undefined) {
                if (bullet.model.position.distanceTo(this.gameObjects.playerShip.model.position) > 1000) {
                    bullet.destroy();
                    this.gameObjects.playerShip.bullets.splice(this.gameObjects.playerShip.bullets.indexOf(bullet), 1);
                }
            }
        });

        // Enemy bullets
        this.gameObjects.enemyShips.forEach((enemyShip) => {
            if (enemyShip.model !== undefined) {
                enemyShip.bullets.forEach((bullet) => {
                    if (bullet.model !== undefined) {
                        if (bullet.model.position.distanceTo(enemyShip.model.position) > 1000) {
                            bullet.destroy();
                            enemyShip.bullets.splice(enemyShip.bullets.indexOf(bullet), 1);
                        }
                    }
                });
            }
        });
    }

    // Adjust the camera to follow the player ship
    adjustCamera() {
        // We ensure that the player ship is always in front of the camera
        if (this.gameObjects.playerShip.model !== undefined) {
            // Update camera position
            if (this.cameraView === 0) {
                // Third-person view
                this.camera.position.set(0, 2, 3);
            } else if (this.cameraView === 1) {
                // Bird's-eye view
                this.camera.position.set(0, 10, 0.1);
            }

            this.camera.lookAt(this.gameObjects.playerShip.model.position);
        }
    }
}

// TODO: Make plane infinite
// TODO: Use distanceTo wherever needed
// TODO: Change models