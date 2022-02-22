class EnemyShip {
    constructor(scene, position) {
        const modelLoader = new THREE.GLTFLoader();
        modelLoader.load("../../assets/models/enemy_ship.glb", (obj) => {
            obj.scene.scale.set(5, 5, 5);
            obj.scene.position.set(position.x, position.y, position.z);
            this.model = obj.scene;
            this.velocity = 0.1;
            this.bullets = [];

            // We need to store the scene so we can add the bullets to it
            this.scene = scene;

            scene.add(this.model);
        });
    }

    // Move the enemy ship towards the player ship
    move(playerShipPosition) {
        if (this.model !== undefined) {
            // We orient the enemy ship towards the player ship
            this.model.lookAt(playerShipPosition);

            // We then move the enemy ship forward. Because of the orientation,
            // this will move the enemy ship in the direction of the player ship.
            this.model.translateZ(this.velocity);
        }
    }

    // Shoot a bullet (i.e. create a new bullet)
    shoot() {
        if (this.model !== undefined) {
            const bullet = new Bullet(this.scene, this.model.position, this.model.rotation);
            this.bullets.push(bullet);
        }
    }

    // Move the enemy's bullets and destroy them if they are out of bounds
    updateBullets() {
        if (this.model !== undefined && this.bullets.length > 0) {
            this.bullets.forEach((bullet) => {
                bullet.move();
            });
        }
    }
}