class PlayerShip {
    constructor(scene, camera) {
        const modelLoader = new THREE.GLTFLoader();
        modelLoader.load("../../assets/models/player_ship.glb", (obj) => {
            obj.scene.scale.set(5, 5, 5);
            obj.scene.position.set(0, 2, -15);
            obj.scene.rotation.set(0, 0, 0);
            this.model = obj.scene;
            this.velocity = 0.1;
            scene.add(this.model);

            // Adjusting the camera to look at the player
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
            default:
                break;
        }
    }

    update() { }
}