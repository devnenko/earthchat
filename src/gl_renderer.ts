import * as THREE from 'three';
import earthVert from "./shaders/earth_vert.glsl"
import earthFrag from "./shaders/earth_frag.glsl"
import atmoVert from "./shaders/atmo_vert.glsl"
import atmoFrag from "./shaders/atmo_frag.glsl"




export class GlRenderer {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    loader: THREE.LoadingManager;
    textures: { 
        earthDay: THREE.Texture, 
        earthNight: THREE.Texture, 
        earthClouds: THREE.Texture 
    }
    meshDetail: number;
    earthMat: THREE.ShaderMaterial;
    atmosphereMat: THREE.ShaderMaterial;
    isLoaded = false;


    constructor(scene: THREE.Scene, meshDetail = 7) {
        this.scene = scene
        this.meshDetail = meshDetail
        this.renderer = this.createRenderer()
        this.loader = this.createLoader()
        this.addStars();
        this.textures = this.loadTextures()
        this.earthMat = this.addEarth()
        this.atmosphereMat = this.addAtmosphere()

        this.updateSun()
        //update the sun every 60 seconds
        setInterval(this.updateSun.bind(this), 60 * 1000);


    }

    private createRenderer() {
        const renderer = new THREE.WebGLRenderer()
        document.body.appendChild(renderer.domElement)
        return renderer;
    }

    private createLoader() {
        let progressBar = document.getElementById("loadProgress") as HTMLDivElement;

        const loader = new THREE.LoadingManager();
        loader.onProgress = progress.bind(this)

        function progress(url, itemsLoaded, itemsTotal) {
            const progress = itemsLoaded / itemsTotal * 100;
            console.log("Loading progress: "+progress)
        };

        return loader;
    }

    private addStars() {
        const scene = this.scene;
        scene.background = new THREE.CubeTextureLoader(this.loader)
            .load([
                require('../public/px.png'),
                require('../public/nx.png'),
                require('../public/py.png'),
                require('../public/ny.png'),
                require('../public/pz.png'),
                require('../public/nz.png')
            ]);
        scene.background.magFilter = THREE.NearestFilter;
        scene.background.minFilter = THREE.NearestFilter;
    }

    private loadTextures() {
        let texLoader = new THREE.TextureLoader(this.loader);
        const earthDay = texLoader.load(require('../public/4k_earth_daymap.jpg'));
        const earthNight = texLoader.load(require('../public/2k_earth_nightmap.jpg'));
        const earthClouds = texLoader.load(require('../public/2k_earth_clouds.jpg'));
        return { earthDay, earthNight, earthClouds }
    }


 
    private addEarth() {

        const earthGeometry = new THREE.IcosahedronGeometry(1, this.meshDetail);
        const earthMat = new THREE.ShaderMaterial(
            {
                uniforms: {
                    uDay: { value: this.textures.earthDay },
                    uNight: { value: this.textures.earthNight },
                    uSunRot: { value: 0 }
                },
                vertexShader: earthVert,
                fragmentShader: earthFrag
            })
        const earth = new THREE.Mesh(earthGeometry, earthMat);
        this.scene.add(earth);
        return earthMat
    }

    private addAtmosphere() {
        const atmosphereGeometry = new THREE.IcosahedronGeometry(1.02, this.meshDetail);
        const atmosphereMat = new THREE.ShaderMaterial(
            {
                uniforms: {
                    uClouds: { value: this.textures.earthClouds },
                    uSunRot: { value: 0 },
                },
                vertexShader: atmoVert,
                fragmentShader: atmoFrag,
                blending: THREE.AdditiveBlending,
                depthTest: true,
                transparent: true
            })

        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMat);
        this.scene.add(atmosphere);
        return atmosphereMat;
    }

    private updateSun() {
        let currentDate = new Date();
        let sunRot = currentDate.getUTCHours() * 15 + currentDate.getUTCMinutes() * 15 / 60;
        this.earthMat.uniforms.uSunRot.value = sunRot;
        this.atmosphereMat.uniforms.uSunRot.value = sunRot;

        console.log("Sun rotation set to: "+sunRot)
    }
}