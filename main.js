import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import WebGL from "three/addons/capabilities/WebGL.js";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import { Quaternion } from "three";

const scene = new THREE.Scene();
const radius = 1;

const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
});

/**
    ====== LIGHTS ======
    */
// main light
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

// ambient light
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
====== MESHES/BODIES ======
*/

const dieLoader = new GLTFLoader();
dieLoader.load("/assets/gltf/dice.glb", (gltf) => {
  const diceScene = gltf.scene;
  diceScene.traverse((node) => {
    if (node.name.slice(0, 4) == "Cube") {
      node.castShadow = true;
      node.castShadow = true;
      node.receiveShadow = true;
      const dieMesh = node;
      // die body
      const dieBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(0.38, 0.38, 0.38)),
      });
      dieBody.position.set(-5, 5, -5);
      dieBody.velocity.set(2, 2, 2);
      dieBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 2), 20);
      dieBody.applyLocalImpulse(new CANNON.Vec3(2, 3, 5));
      physicsWorld.addBody(dieBody);
      scene.add(dieMesh);
      const animateDie = () => {
        dieMesh.position.copy(dieBody.position);
        dieMesh.quaternion.copy(dieBody.quaternion);
        window.requestAnimationFrame(animateDie);
      };
      animateDie();
    }
  });
});

const dieLoader2 = new GLTFLoader();
dieLoader2.load("/assets/gltf/dice.glb", (gltf) => {
  const diceScene = gltf.scene;
  diceScene.traverse((node) => {
    if (node.name.slice(0, 4) == "Cube") {
      node.castShadow = true;
      node.castShadow = true;
      node.receiveShadow = true;
      const dieMesh = node;
      // die body
      const dieBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(0.38, 0.38, 0.38)),
      });
      dieBody.position.set(-6, 5, -5);
      dieBody.velocity.set(5, 5.5, 2);
      dieBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-0.5, 0, 2), 20);
      dieBody.applyLocalImpulse(new CANNON.Vec3(1, 2, 3));
      physicsWorld.addBody(dieBody);
      scene.add(dieMesh);
      const animateDie = (opts) => {
        dieMesh.position.copy(dieBody.position);
        dieMesh.quaternion.copy(dieBody.quaternion);
        window.requestAnimationFrame(animateDie);
      };
      animateDie();
    }
  });
});

// ground mesh
const groundGeometry = new THREE.BoxGeometry(20, 0.04, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floorGround = new THREE.Mesh(groundGeometry, groundMaterial);
floorGround.castShadow = false;
floorGround.receiveShadow = true;
scene.add(floorGround);
// ground body
const groundBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Box(new CANNON.Vec3(10, 0.02, 10)),
});
physicsWorld.addBody(groundBody);

// // box mesh
// const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
// const boxMaterial = new THREE.MeshNormalMaterial();
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// boxMesh.castShadow = true;
// boxMesh.receiveShadow = true;
// scene.add(boxMesh);
// box body
// const boxBody = new CANNON.Body({
//   mass: 5,
//   shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
// });
// boxBody.position.set(0.5, 15, 1);
// physicsWorld.addBody(boxBody);

// sphere mesh
// const sphereGeometry = new THREE.SphereGeometry(radius);
// const sphereMaterial = new THREE.MeshNormalMaterial();
// const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
// sphereMesh.castShadow = true;
// sphereMesh.receiveShadow = true;
// scene.add(sphereMesh);
// // sphere body
// const sphereBody = new CANNON.Body({
//   mass: 5,
//   shape: new CANNON.Sphere(radius),
// });
// sphereBody.position.set(0.1, 1, 1);
// physicsWorld.addBody(sphereBody);

/**
====== CAMERA ======
*/
// main
const fov = 40;
const aspect = window.innerWidth / window.innerHeight;
const near = 1.0;
const far = 1000.0;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(10, 5, 9);

// camera position
camera.position.z = 2;

/**
====== RENDERING ======
*/
// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });

// camera controls
const controls = new OrbitControls(camera, renderer.domElement);

const cannonDebugger = new CannonDebugger(scene, physicsWorld);

const animate = (opts) => {
  physicsWorld.fixedStep();
  // cannonDebugger.update();
  // sphereMesh.position.copy(sphereBody.position);
  // sphereMesh.quaternion.copy(sphereBody.quaternion);
  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(animate);
};
animate();

// renderer options
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
