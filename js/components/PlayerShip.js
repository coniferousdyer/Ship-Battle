class PlayerShip {
    constructor(scene, camera) {
        const modelLoader = new THREE.GLTFLoader();
        modelLoader.load("../../assets/models/player_ship.glb", (obj) => {
            obj.scene.scale.set(5, 5, 5);
            obj.scene.position.set(0, 2, -15);
            this.model = obj.scene;
            this.velocity = 0.4;
            this.bullets = [];

            // We need to store the scene so we can add the bullets to it
            this.scene = scene;

            scene.add(this.model);

            // Ensuring the camera looks at the player at all times
            this.model.add(camera);
            camera.lookAt(this.model.position);
        });
    }

    processInput(input) {
        switch (input) {
            case "w": // Forward
            case "W":
                this.model.translateZ(-this.velocity);
                break;
            case "s": // Backward
            case "S":
                this.model.translateZ(this.velocity);
                break;
            case "a": // Left
            case "A":
                this.model.rotation.y += 0.1 * this.velocity;
                break;
            case "d": // Right
            case "D":
                this.model.rotation.y -= 0.1 * this.velocity;
                break;
            case "q": // Shoot
            case "Q":
                this.shoot();
                break;
            default:
                break;
        }
    }

    // Shoot a bullet
    shoot() {
        if (this.model !== undefined) {
            const bullet = new Bullet(this.scene, this.model.position, this.model.rotation, true);
            this.bullets.push(bullet);
        }
    }

    // Move the player's bullets and destroy them if they are out of bounds
    updateBullets() {
        if (this.model !== undefined && this.bullets.length > 0) {
            this.bullets.forEach((bullet) => {
                bullet.move();
            });
        }
    }
}