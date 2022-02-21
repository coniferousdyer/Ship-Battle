class EnemyShip {
    constructor(scene, position) {
        const modelLoader = new THREE.GLTFLoader();
        modelLoader.load("../../assets/models/enemy_ship.glb", (obj) => {
            obj.scene.scale.set(5, 5, 5);
            obj.scene.position.set(position.x, position.y, position.z);
            this.model = obj.scene;
            this.velocity = 0.1;
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
}