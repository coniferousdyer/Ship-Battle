class PlayerShip {
    constructor(scene) {
        const modelLoader = new THREE.GLTFLoader();
        modelLoader.load("/3D-Game/assets/models/player_ship.glb", (obj) => {
            obj.scene.scale.set(5, 5, 5);
            obj.scene.position.set(0, 1, -15);
            obj.scene.rotation.set(0, 0, 0);
            this.model = obj.scene;
            scene.add(this.model);
        });
    }

    update() { }
}