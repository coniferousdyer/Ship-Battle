class World {
    constructor(scene, renderer) {
        // Ocean
        const oceanGeometry = new THREE.PlaneGeometry(10000, 10000);

        const oceanMaterial = {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('../../assets/textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }

        this.waterModel = new THREE.Water(oceanGeometry, oceanMaterial);
        this.waterModel.rotation.x = -Math.PI / 2;
        this.waterModel.position.y = -1;
        scene.add(this.waterModel);

        // Sky
        this.skyModel = new THREE.Sky();
        this.skyModel.scale.setScalar(10000);
        this.skyModel.material.uniforms['turbidity'].value = 10;
        this.skyModel.material.uniforms['rayleigh'].value = 2;
        this.skyModel.material.uniforms['mieCoefficient'].value = 0.005;
        this.skyModel.material.uniforms['mieDirectionalG'].value = 0.8;
        scene.add(this.skyModel);

        // Sun
        this.sunModel = new THREE.Vector3();
        this.pmremGenerator = new THREE.PMREMGenerator(renderer);

        // Adding the effects to complete the environment
        const parameters = {
            inclination: 0.49,
            azimuth: 0.205
        };

        const theta = Math.PI * (parameters.inclination - 0.5);
        const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

        this.sunModel.x = Math.cos(phi);
        this.sunModel.y = Math.sin(phi) * Math.sin(theta);
        this.sunModel.z = Math.sin(phi) * Math.cos(theta);

        this.skyModel.material.uniforms['sunPosition'].value.copy(this.sunModel);
        this.waterModel.material.uniforms['sunDirection'].value.copy(this.sunModel).normalize();
        scene.environment = this.pmremGenerator.fromScene(this.skyModel).texture;
    }

    update() {
        this.waterModel.material.uniforms['time'].value += 1.0 / 60.0;
    }
}