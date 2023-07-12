import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import WebGL from "three/addons/capabilities/WebGL.js";
import CANNON from "cannon";

const scene = new THREE.Scene();

/**
    ====== LIGHTS ======
    */
// main
let light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(20, 15, 5);
light.target.position.set(0, 0, 0);
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500.0;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500.0;
light.shadow.camera.left = 100;
light.shadow.camera.right = -100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
scene.add(light);

// ambient
light = new THREE.AmbientLight(0x000000);
scene.add(light);

/**
    ====== SKYBOX ======
    */
const skyboxLoader = new THREE.CubeTextureLoader();
const texture = skyboxLoader.load([
  "/assets/skybox/posx.jpg",
  "/assets/skybox/negx.jpg",
  "/assets/skybox/posy.jpg",
  "/assets/skybox/negy.jpg",
  "/assets/skybox/posz.jpg",
  "/assets/skybox/negz.jpg",
]);
scene.background = texture;
// allows the skybox to cast light on objects
scene.environment = texture;

/**
    ====== OBJECTS/MESHES ======
    */

// dice
// const loader = new GLTFLoader();
// loader.load("/assets/gltf/dice.glb", (gltf) => {
//   gltf.scene.traverse((cb) => {
//     cb.castShadow = true;
//     cb.position.set(0, 0.2, 0);
//     cb.castShadow = true;
//     cb.receiveShadow = true;
//   });
//   scene.add(gltf.scene);
// });

// box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xd1118 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 2, 0);
box.castShadow = true;
box.receiveShadow = true;
scene.add(box);

// floor plane
const planeGeometry = new THREE.BoxGeometry(10, 0.1, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floorPlane = new THREE.Mesh(planeGeometry, planeMaterial);
floorPlane.castShadow = false;
floorPlane.receiveShadow = true;
scene.add(floorPlane);

/**
    ====== CAMERA ======
    */
// main
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 1.0;
const far = 1000.0;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(5, 3, 0);

// camera position
camera.position.z = 5;

/**
    ====== RENDERING ======
    */
// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });

// camera controls
const controls = new OrbitControls(camera, renderer.domElement);

// animation frame
function raf() {
  requestAnimationFrame((time) => {
    renderer.render(scene, camera);
    raf();
  });

  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  controls.update();
}

// renderer options
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// only run on supported browsers
if (WebGL.isWebGLAvailable()) {
  raf();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("container").appendChild(warning);
}
