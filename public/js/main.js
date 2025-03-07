// Define cube data with logos
const cubeData = [
  { id: 'strava', logo: 'STRAVA' },
  { id: 'sonos', logo: 'SONOS' },
  { id: 'travis', logo: 'TRAVIS' },
  { id: 'lululemon', logo: 'LULULEMON' },
  { id: 'lulu', logo: 'ㅁ' },
  { id: 'spotify', logo: 'ⓢ' },
  { id: 'sony', logo: 'SONY' },
  { id: 'away', logo: 'AWAY' },
  { id: 'lego', logo: 'LEGO' },
  { id: 'nyt', logo: 'ℑ' },
  { id: 'airbnb', logo: 'A' },
  { id: 'instagram', logo: 'ⓘ', link: 'https://www.instagram.com/_arya.sen/' }
];

// Initialize scene, camera, and renderer
let scene, camera, renderer;
let cubes = [];
let raycaster, mouse;
let canvasContainer;

// Mouse movement tracking
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

// Animation tracking
let clickedCube = null;
let clickAnimationTime = 0;
const CLICK_ANIMATION_DURATION = 0.5; // in seconds

// Theme state
let isDarkMode = true;

// Initialize the 3D scene
function init() {
  console.log("Initializing 3D scene...");
  canvasContainer = document.getElementById('canvas-container');
  
  if (!canvasContainer) {
    console.error("Canvas container not found!");
    return;
  }
  
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(isDarkMode ? 0x000000 : 0xffffff);
  
  // Create camera
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
  camera.position.z = 15;
  
  // Create renderer with better depth precision
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    logarithmicDepthBuffer: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  canvasContainer.appendChild(renderer.domElement);
  
  // Setup raycaster for interaction
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  // Create cubes
  createCubes();
  
  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onMouseClick);
  
  // Add cursor style change for interactive elements
  document.addEventListener('mousemove', updateCursor);
  
  // Setup theme toggle
  setupThemeToggle();
  
  // Start animation loop
  animate();
  
  console.log("3D scene initialized with", cubes.length, "cubes");
}

// Setup theme toggle functionality
function setupThemeToggle() {
  const toggleBtn = document.querySelector('.toggle-btn');
  if (!toggleBtn) return;
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDarkMode = savedTheme === 'dark';
    updateTheme();
  }
  
  // Add click event listener to toggle button
  toggleBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    updateTheme();
    
    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  });
}

// Update theme based on current mode
function updateTheme() {
  // Update body class
  if (isDarkMode) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }
  
  // Update scene background
  scene.background = new THREE.Color(isDarkMode ? 0x000000 : 0xffffff);
  
  // Update cube materials
  cubes.forEach(cube => {
    // Recreate textures with current theme
    updateCubeMaterials(cube);
  });
}

// Update cube materials based on current theme
function updateCubeMaterials(cubeGroup) {
  const data = cubeData.find(d => d.id === cubeGroup.userData.id);
  if (!data) return;
  
  // Create new textures
  const normalTexture = createTextTexture(data.logo, false);
  const invertedTexture = createTextTexture(data.logo, true);
  
  // Update stored textures
  cubeGroup.userData.normalTexture = normalTexture;
  cubeGroup.userData.invertedTexture = invertedTexture;
  
  // Create new edge materials
  const normalEdgeMaterial = new THREE.LineBasicMaterial({ 
    color: isDarkMode ? 0xffffff : 0x000000,
    transparent: true,
    opacity: 0.7,
    depthTest: true,
    depthWrite: true,
    linewidth: 1.05
  });
  
  const invertedEdgeMaterial = new THREE.LineBasicMaterial({ 
    color: isDarkMode ? 0x000000 : 0xffffff,
    transparent: true,
    opacity: 0.85,
    depthTest: true,
    depthWrite: true,
    linewidth: 1.05
  });
  
  const clickedEdgeMaterial = new THREE.LineBasicMaterial({ 
    color: isDarkMode ? 0xffffff : 0x000000,
    transparent: true,
    opacity: 1.0,
    depthTest: true,
    depthWrite: true,
    linewidth: 2.1
  });
  
  // Update stored materials
  cubeGroup.userData.normalEdgeMaterial = normalEdgeMaterial;
  cubeGroup.userData.invertedEdgeMaterial = invertedEdgeMaterial;
  cubeGroup.userData.clickedEdgeMaterial = clickedEdgeMaterial;
  
  // Update face materials
  cubeGroup.userData.faces.forEach(face => {
    face.material.map = cubeGroup.userData.isHovered ? 
      cubeGroup.userData.invertedTexture : 
      cubeGroup.userData.normalTexture;
    face.material.needsUpdate = true;
  });
  
  // Update edge materials
  cubeGroup.userData.edges.forEach(edge => {
    edge.material = cubeGroup.userData.isHovered ? 
      cubeGroup.userData.invertedEdgeMaterial : 
      cubeGroup.userData.normalEdgeMaterial;
    edge.material.needsUpdate = true;
  });
}

// Create the 3D cubes
function createCubes() {
  const gridSize = 4; // 4x3 grid
  const spacing = 2.5;
  const startX = -((gridSize - 1) * spacing) / 2;
  const startY = -((3 - 1) * spacing) / 2;
  
  cubeData.forEach((data, index) => {
    // Calculate position in grid
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const x = startX + col * spacing;
    const y = startY + row * spacing;
    
    // Create a group to hold the cube elements
    const cubeGroup = new THREE.Group();
    cubeGroup.position.set(x, y, 0);
    cubeGroup.userData = { 
      id: data.id,
      isHovered: false,
      isClicked: false,
      normalTexture: null,
      invertedTexture: null,
      normalEdgeMaterial: null,
      invertedEdgeMaterial: null,
      clickedEdgeMaterial: null,
      faces: [],
      edges: [],
      link: data.link || null,
      originalScale: new THREE.Vector3(1, 1, 1),
      targetScale: new THREE.Vector3(1, 1, 1)
    };
    scene.add(cubeGroup);
    cubes.push(cubeGroup);
    
    // Create cube faces with text
    const size = 1.0; // Even smaller cube size
    const halfSize = size / 2;
    
    // Create normal and inverted textures
    const normalTexture = createTextTexture(data.logo, false);
    const invertedTexture = createTextTexture(data.logo, true);
    
    // Store textures in userData for hover effect
    cubeGroup.userData.normalTexture = normalTexture;
    cubeGroup.userData.invertedTexture = invertedTexture;
    
    // Create materials
    const normalMaterial = new THREE.MeshBasicMaterial({
      map: normalTexture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    });
    
    const invertedMaterial = new THREE.MeshBasicMaterial({
      map: invertedTexture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    });
    
    // Create the six faces of the cube
    const faces = [];
    
    // Front face
    const frontFace = createFace(size, normalMaterial);
    frontFace.position.z = halfSize;
    cubeGroup.add(frontFace);
    faces.push(frontFace);
    
    // Back face
    const backFace = createFace(size, normalMaterial);
    backFace.position.z = -halfSize;
    backFace.rotation.y = Math.PI;
    cubeGroup.add(backFace);
    faces.push(backFace);
    
    // Top face
    const topFace = createFace(size, normalMaterial);
    topFace.position.y = halfSize;
    topFace.rotation.x = -Math.PI / 2;
    cubeGroup.add(topFace);
    faces.push(topFace);
    
    // Bottom face
    const bottomFace = createFace(size, normalMaterial);
    bottomFace.position.y = -halfSize;
    bottomFace.rotation.x = Math.PI / 2;
    cubeGroup.add(bottomFace);
    faces.push(bottomFace);
    
    // Right face
    const rightFace = createFace(size, normalMaterial);
    rightFace.position.x = halfSize;
    rightFace.rotation.y = Math.PI / 2;
    cubeGroup.add(rightFace);
    faces.push(rightFace);
    
    // Left face
    const leftFace = createFace(size, normalMaterial);
    leftFace.position.x = -halfSize;
    leftFace.rotation.y = -Math.PI / 2;
    cubeGroup.add(leftFace);
    faces.push(leftFace);
    
    // Store faces in userData
    cubeGroup.userData.faces = faces;
    
    // Create edge materials
    const normalEdgeMaterial = new THREE.LineBasicMaterial({ 
      color: isDarkMode ? 0xffffff : 0x000000,
      transparent: true,
      opacity: 0.7, // Increased opacity for better visibility
      depthTest: true,
      depthWrite: true,
      linewidth: 1.05 // Increased thickness by 5%
    });
    
    const invertedEdgeMaterial = new THREE.LineBasicMaterial({ 
      color: isDarkMode ? 0x000000 : 0xffffff,
      transparent: true,
      opacity: 0.85, // Increased opacity for better visibility
      depthTest: true,
      depthWrite: true,
      linewidth: 1.05 // Increased thickness by 5%
    });
    
    const clickedEdgeMaterial = new THREE.LineBasicMaterial({ 
      color: isDarkMode ? 0xffffff : 0x000000,
      transparent: true,
      opacity: 1.0,
      depthTest: true,
      depthWrite: true,
      linewidth: 2.1 // Increased thickness by 5% (from 2.0)
    });
    
    // Store edge materials in userData
    cubeGroup.userData.normalEdgeMaterial = normalEdgeMaterial;
    cubeGroup.userData.invertedEdgeMaterial = invertedEdgeMaterial;
    cubeGroup.userData.clickedEdgeMaterial = clickedEdgeMaterial;
    
    // Add edges to the cube
    addCubeEdges(cubeGroup, size, normalEdgeMaterial);
  });
}

// Create a face with text
function createFace(size, material) {
  const geometry = new THREE.PlaneGeometry(size, size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 1; // Ensure faces render before edges
  return mesh;
}

// Create text texture
function createTextTexture(text, inverted) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  
  // Determine colors based on theme and inverted state
  let bgColor, textColor;
  
  if (isDarkMode) {
    // Dark mode
    bgColor = inverted ? '#ffffff' : '#000000';
    textColor = inverted ? '#000000' : '#ffffff';
  } else {
    // Light mode
    bgColor = inverted ? '#000000' : '#ffffff';
    textColor = inverted ? '#ffffff' : '#000000';
  }
  
  // Fill background
  context.fillStyle = bgColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add text
  context.font = 'bold 50px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = textColor;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

// Add edges to the cube
function addCubeEdges(cubeGroup, size, material) {
  const halfSize = size / 2;
  const edges = [];
  
  // Define the 12 edges of a cube
  const edgePositions = [
    // Bottom face edges
    [-halfSize, -halfSize, -halfSize, halfSize, -halfSize, -halfSize],
    [halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize],
    [halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize],
    [-halfSize, -halfSize, halfSize, -halfSize, -halfSize, -halfSize],
    
    // Top face edges
    [-halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize],
    [halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize],
    [halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize],
    [-halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize],
    
    // Connecting edges
    [-halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize],
    [halfSize, -halfSize, -halfSize, halfSize, halfSize, -halfSize],
    [halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize],
    [-halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize]
  ];
  
  // Create each edge
  edgePositions.forEach(edge => {
    const points = [
      new THREE.Vector3(edge[0], edge[1], edge[2]),
      new THREE.Vector3(edge[3], edge[4], edge[5])
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    line.renderOrder = 2; // Ensure edges render after faces
    cubeGroup.add(line);
    edges.push(line);
  });
  
  // Store edges in userData
  cubeGroup.userData.edges = edges;
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse movement
function onMouseMove(event) {
  // Update mouse position for raycaster
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Update target mouse position for cube rotation
  targetMouseX = (event.clientX - window.innerWidth / 2) * 0.0006;
  targetMouseY = (event.clientY - window.innerHeight / 2) * 0.0006;
}

// Update cursor style based on hover
function updateCursor() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  let isOverLink = false;
  
  if (intersects.length > 0) {
    // Find the parent cube group
    let object = intersects[0].object;
    let cubeGroup = object;
    
    // Traverse up to find the cube group
    while (cubeGroup && !cubeGroup.userData.id) {
      cubeGroup = cubeGroup.parent;
    }
    
    if (cubeGroup && cubeGroup.userData.link) {
      isOverLink = true;
    }
  }
  
  // Change cursor style
  document.body.style.cursor = isOverLink ? 'pointer' : 'default';
}

// Handle mouse click
function onMouseClick(event) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    // Find the parent cube group
    let object = intersects[0].object;
    let cubeGroup = object;
    
    // Traverse up to find the cube group
    while (cubeGroup && !cubeGroup.userData.id) {
      cubeGroup = cubeGroup.parent;
    }
    
    if (cubeGroup && cubeGroup.userData.id) {
      console.log('Clicked on cube:', cubeGroup.userData.id);
      
      // Start click animation
      startClickAnimation(cubeGroup);
      
      // If the cube has a link, open it after a short delay
      if (cubeGroup.userData.link) {
        setTimeout(() => {
          window.open(cubeGroup.userData.link, '_blank');
        }, 300); // Delay to allow animation to be visible
      }
    }
  }
}

// Start click animation for a cube
function startClickAnimation(cubeGroup) {
  // Set as clicked cube
  clickedCube = cubeGroup;
  clickAnimationTime = 0;
  
  // Apply clicked state
  cubeGroup.userData.isClicked = true;
  
  // Set target scale for animation
  cubeGroup.userData.targetScale.set(1.15, 1.15, 1.15);
  
  // Apply thicker edge material
  cubeGroup.userData.edges.forEach(edge => {
    edge.material = cubeGroup.userData.clickedEdgeMaterial;
    edge.material.needsUpdate = true;
  });
}

// Set cube hover state
function setCubeHoverState(cubeGroup, isHovered) {
  if (cubeGroup.userData.isHovered === isHovered) return;
  
  cubeGroup.userData.isHovered = isHovered;
  
  // Don't change materials if cube is in clicked state
  if (cubeGroup.userData.isClicked) return;
  
  // Update face materials
  cubeGroup.userData.faces.forEach(face => {
    face.material.map = isHovered ? 
      cubeGroup.userData.invertedTexture : 
      cubeGroup.userData.normalTexture;
    face.material.needsUpdate = true;
  });
  
  // Update edge materials
  cubeGroup.userData.edges.forEach(edge => {
    edge.material = isHovered ? 
      cubeGroup.userData.invertedEdgeMaterial : 
      cubeGroup.userData.normalEdgeMaterial;
    edge.material.needsUpdate = true;
  });
  
  // Scale effect
  if (isHovered) {
    cubeGroup.userData.targetScale.set(1.03, 1.03, 1.03);
  } else {
    cubeGroup.userData.targetScale.set(1, 1, 1);
  }
}

// Update click animation
function updateClickAnimation(deltaTime) {
  if (!clickedCube) return;
  
  clickAnimationTime += deltaTime;
  
  if (clickAnimationTime >= CLICK_ANIMATION_DURATION) {
    // Animation complete, reset to normal state
    clickedCube.userData.isClicked = false;
    
    // Reset edge materials based on hover state
    clickedCube.userData.edges.forEach(edge => {
      edge.material = clickedCube.userData.isHovered ? 
        clickedCube.userData.invertedEdgeMaterial : 
        clickedCube.userData.normalEdgeMaterial;
      edge.material.needsUpdate = true;
    });
    
    // Reset target scale
    clickedCube.userData.targetScale.set(
      clickedCube.userData.isHovered ? 1.03 : 1,
      clickedCube.userData.isHovered ? 1.03 : 1,
      clickedCube.userData.isHovered ? 1.03 : 1
    );
    
    clickedCube = null;
  }
}

// Animation loop
function animate() {
  const now = performance.now() / 1000; // Convert to seconds
  const deltaTime = now - (animate.lastTime || now);
  animate.lastTime = now;
  
  requestAnimationFrame(animate);
  
  // Update click animation
  updateClickAnimation(deltaTime);
  
  // Smooth mouse movement
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;
  
  // Rotate cubes based on mouse position
  cubes.forEach(cube => {
    // Calculate distance from center to create a wave effect
    const distX = cube.position.x;
    const distY = cube.position.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    // Rotate cube based on mouse position and distance
    cube.rotation.x = mouseY * (1 + distance * 0.1);
    cube.rotation.y = mouseX * (1 + distance * 0.1);
    
    // Add a slight constant rotation to make cubes more visible
    cube.rotation.x += 0.0002;
    cube.rotation.y += 0.0002;
    
    // Smooth scale animation
    cube.scale.lerp(cube.userData.targetScale, 0.1);
  });
  
  // Update raycaster for hover effects
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  // Reset all hover states first
  let hoveredCube = null;
  
  if (intersects.length > 0) {
    // Find the parent cube group
    let object = intersects[0].object;
    let cubeGroup = object;
    
    // Traverse up to find the cube group
    while (cubeGroup && !cubeGroup.userData.id) {
      cubeGroup = cubeGroup.parent;
    }
    
    if (cubeGroup && cubeGroup.userData.id) {
      hoveredCube = cubeGroup;
    }
  }
  
  // Update hover states
  cubes.forEach(cube => {
    if (!cube.userData.isClicked) {
      setCubeHoverState(cube, cube === hoveredCube);
    }
  });
  
  renderer.render(scene, camera);
}

// Initialize when the DOM is ready
window.addEventListener('load', init); 