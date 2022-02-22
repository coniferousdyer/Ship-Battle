class Bullet {
    constructor(scene, position, rotation, player = false) {
        const modelLoader = new THREE.GLTFLoader();
        modelLoader.load("../../assets/models/bullet.glb", (obj) => {
            obj.scene.scale.set(0.5, 0.5, 0.5);
            obj.scene.position.set(position.x, position.y + 2, position.z - 3);

            // If the bullet is fired by the player, we need to fire it in the opposite direction
            if (player) {
                obj.scene.rotation.set(rotation.x, rotation.y - Math.PI, rotation.z);
            } else {
                obj.scene.rotation.set(rotation.x, rotation.y, rotation.z);
            }

            this.model = obj.scene;
            this.velocity = 1;
            scene.add(this.model);
        });
    }

    // Move the bullet forward
    move() {
        if (this.model !== undefined) {
            this.model.translateZ(this.velocity);
        }
    }
}