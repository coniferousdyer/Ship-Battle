class TreasureChest {
    constructor(scene, position) {
        const modelLoader = new THREE.GLTFLoader();
        modelLoader.load("../../assets/models/treasure_chest.glb", (obj) => {
            obj.scene.scale.set(3, 3, 3);
            obj.scene.position.set(position.x, position.y, position.z);
            this.model = obj.scene;
            this.scene = scene;
            scene.add(this.model);
        });
    }

    // Destroy the treasure chest
    destroy() {
        if (this.model !== undefined) {
            this.scene.remove(this.model);
        }
    }
}