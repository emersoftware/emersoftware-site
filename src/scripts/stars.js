import * as THREE from 'three';

let scene, camera, renderer, stars;
let mouseX = 0;
let mouseY = 0;
let currentRotationSpeedX = 0;

const starColorsArray = [
  new THREE.Color(0xc1ffcf), // mint
  new THREE.Color(0x0400b4), // night
  new THREE.Color(0xff823c), // tangerine
];

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3500);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({ alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('stars-container').appendChild(renderer.domElement);

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
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
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
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  const starVertices = [];
  const starInstanceColors = [];

  for (let i = 0; i < 500; i++) {
    const x = (Math.random() - 0.5) * 3000;
    const y = (Math.random() - 0.5) * 3000;
    const z = (Math.random() - 0.5) * 3000;
    starVertices.push(x, y, z);

    const color = starColorsArray[Math.floor(Math.random() * starColorsArray.length)];
    starInstanceColors.push(color.r, color.g, color.b);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starInstanceColors, 3)); // Add color attribute

  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('scroll', onScroll, false);
  document.addEventListener('mousemove', onDocumentMouseMove, false);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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

  renderer.render(scene, camera);
}

init();
