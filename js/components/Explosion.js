class Explosion {
    constructor(scene, position, scale_amount) {
        const modelLoader = new THREE.GLTFLoader();
        modelLoader.load("../../assets/models/explosion.glb", (obj) => {
            obj.scene.scale.set(scale_amount, scale_amount, scale_amount);
            obj.scene.position.set(position.x, position.y, position.z);
            this.model = obj.scene;
            this.scene = scene;
            this.time = 0;
            scene.add(this.model);
        });
    }

    // Update the explosion's position
    update() {
        if (this.model !== undefined) {
            this.time += 0.1;
            this.model.position.y += 0.1;
        }
    }

    // Destroy the explosion after a certain amount of time
    destroy() {
        if (this.model !== undefined) {
            this.scene.remove(this.model);
        }
    }
}