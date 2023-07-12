import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import WebGL from "three/addons/capabilities/WebGL.js";
import Ammo from "/ammo.js";

const scene = new THREE.Scene();

/**
 ====== PHYSICS/INITIALIZATION ======
 */
window.addEventListener("DOMContentLoaded", async () => {
  Ammo().then((lib) => {
    const Ammo = lib;
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
      dispatcher,
      broadphase,
      solver,
      collisionConfiguration
    );
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

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
    //  rigid bodies collection
    const rigidBodies = [];
    const tmpTransform = new Ammo.btTransform();

    // helpers
    const createBox = (mass, pos, quat, size) => {
      const transform = new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );

      const motionState = new Ammo.btDefaultMotionState(transform);

      const btSize = new Ammo.btVector3(
        size.x * 0.5,
        size.y * 0.5,
        size.z * 0.5
      );
      const shape = new Ammo.btBoxShape(btSize);
      shape.setMargin(0.05);

      const inertia = new Ammo.btVector3(0, 0, 0);
      if (mass > 0) {
        shape.calculateLocalInertia(mass, inertia);
      }

      const info = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        shape,
        inertia
      );
      const body = new Ammo.btRigidBody(info);
      body.motionState = motionState;

      // Ammo.destroy(btSize);
      return { body, motionState };
    };

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
    box.position.set(-2, 2, -2);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    //  box rigid body
    const rbBox = createBox(1, box.position, box.quaternion, boxGeometry);
    // debugger;
    physicsWorld.addRigidBody(rbBox.body);
    rigidBodies.push({ mesh: box, rigidBody: rbBox });

    // floor plane
    const planeGeometry = new THREE.BoxGeometry(10, 0.1, 10);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const floorPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    floorPlane.castShadow = false;
    floorPlane.receiveShadow = true;
    scene.add(floorPlane);

    // floor plane rigid body
    const rbFloorPlane = createBox(
      0,
      floorPlane.position,
      floorPlane.quaternion,
      new THREE.Vector3(10, 0.1, 10)
    );
    physicsWorld.addRigidBody(rbFloorPlane.body);
    // rigidBodies.push({ mesh: floorPlane, rigidBody: rbFloorPlane });

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
    let previousRAF = null;
    function raf() {
      requestAnimationFrame((time) => {
        if (previousRAF === null) {
          previousRAF = time;
        }
        step(time - previousRAF);
        renderer.render(scene, camera);
        raf();
        previousRAF = time;
      });

      // boxMesh.rotation.x += 0.01;
      // boxMesh.rotation.y += 0.01;
      controls.update();
    }

    const step = (timeElapsed) => {
      const timeElapsedS = timeElapsed * 0.001;
      physicsWorld.stepSimulation(timeElapsedS, 10);

      rigidBodies.forEach((rb, i) => {
        rb.rigidBody.motionState.getWorldTransform(tmpTransform);
        const pos = tmpTransform.getOrigin();
        const quat = tmpTransform.getRotation();
        const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
        const quat3 = new THREE.Quaternion(
          quat.x(),
          quat.y(),
          quat.z(),
          quat.w()
        );
        // debugger;
        rb.mesh.position.copy(pos3);
        rb.mesh.quaternion.copy(quat3);
      });
    };

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
  });
});
