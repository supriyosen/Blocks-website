// Simple Three.js test
console.log("Testing Three.js...");

function init() {
  const container = document.getElementById('canvas-container');
  
  if (!container) {
    console.error("Canvas container not found!");
    return;
  }
  
  console.log("Container found:", container);
  
  // Create a simple scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  
  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  
  // Create a simple cube
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  
  // Animation function
  function animate() {
    requestAnimationFrame(animate);
    
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
  }
  
  animate();
  console.log("Three.js test initialized successfully");
}

window.addEventListener('load', init); 