import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer, stars, composer, bloomPass;
let fadeScene, fadeCamera, fadeMesh; // For trailing effect
let currentRotationSpeedX = 0;
let mouseX = 0;
let mouseY = 0;

const lightModeStarColors = [
  new THREE.Color(0x00280e), // forest
  new THREE.Color(0x000000), // black
  new THREE.Color(0xff823c), // tangerine
];

const darkModeStarColors = [
  new THREE.Color(0xffffff), // white
  new THREE.Color(0xc1ffcf), // mint
  new THREE.Color(0x0400b4), // night
];

let currentStarColors = [];

function updateStarColors() {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  currentStarColors = isDarkMode ? darkModeStarColors : lightModeStarColors;

  if (scene) {
    if (isDarkMode) {
      scene.background = new THREE.Color(0x000000); // Black for dark mode
    } else {
      scene.background = new THREE.Color(0xffffff); // White for light mode
    }
  }

  if (composer && bloomPass) {
    if (isDarkMode) {
      bloomPass.threshold = 0.2;
      bloomPass.strength = 2.5;
      bloomPass.radius = 0.5;
    } else {
      bloomPass.threshold = 0.85;
      bloomPass.strength = 0.0;
      bloomPass.radius = 0.3;
    }
  }

  if (stars) {
    const starInstanceColors = [];
    const positions = stars.geometry.attributes.position.array;
    for (let i = 0; i < positions.length / 3; i++) {
      const color = currentStarColors[Math.floor(Math.random() * currentStarColors.length)];
      starInstanceColors.push(color.r, color.g, color.b);
    }
    stars.geometry.setAttribute('color', new THREE.Float32BufferAttribute(starInstanceColors, 3));
    stars.geometry.attributes.color.needsUpdate = true; // Important to update colors
  }
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3500);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({ alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false; // For trailing effect
  document.getElementById('stars-container').appendChild(renderer.domElement);

  // Setup for trailing effect
  fadeScene = new THREE.Scene();
  fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const fadeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.05, // Adjust for trail length (lower value = longer trails)
  });
  const fadeGeometry = new THREE.PlaneGeometry(2, 2);
  fadeMesh = new THREE.Mesh(fadeGeometry, fadeMaterial);
  fadeScene.add(fadeMesh);

  updateStarColors(); // Set initial colors and bloom

  const canvas = document.createElement('canvas');
  const textureSize = 128;
  canvas.width = textureSize;
  canvas.height = textureSize;
  const context = canvas.getContext('2d');
  if (context) {
    // Create a radial gradient for a softer glow effect
    const gradient = context.createRadialGradient(
      textureSize / 2,
      textureSize / 2,
      0,
      textureSize / 2,
      textureSize / 2,
      textureSize / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255,1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, textureSize, textureSize);
  }
  const circleTexture = new THREE.CanvasTexture(canvas);

  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    size: 7,
    map: circleTexture,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
  });

  const starVertices = [];
  const starInstanceColors = [];

  for (let i = 0; i < 500; i++) {
    const x = (Math.random() - 0.5) * 3000;
    const y = (Math.random() - 0.5) * 3000;
    const z = (Math.random() - 0.5) * 3000;
    starVertices.push(x, y, z);

    const color = currentStarColors[Math.floor(Math.random() * currentStarColors.length)];
    starInstanceColors.push(color.r, color.g, color.b);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starInstanceColors, 3)); // Add color attribute

  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // Add HemisphereLight
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(hemiLight);

  // Post-processing
  const mainRenderPass = new RenderPass(scene, camera);
  mainRenderPass.clear = false; // For trailing effect

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2.5,
    0,
    0.85
  );
  bloomPass.threshold = 0.2;
  bloomPass.strength = 2.5;
  bloomPass.radius = 0.5;

  composer = new EffectComposer(renderer);
  composer.addPass(mainRenderPass); // Use the modified mainRenderPass
  composer.addPass(bloomPass);

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('scroll', onScroll, false);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateStarColors);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function onScroll() {
  stars.position.y = window.scrollY * 0.3;
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX / window.innerWidth - 0.5;
  mouseY = event.clientY / window.innerHeight - 0.5;
}

function animate() {
  requestAnimationFrame(animate);

  stars.rotation.x += currentRotationSpeedX;
  stars.rotation.y += 0.001;

  // Render the fade overlay for trailing effect
  renderer.setRenderTarget(null); // Ensure rendering to canvas
  renderer.render(fadeScene, fadeCamera);

  composer.render();
}

init();
