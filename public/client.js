import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Basic client setup
console.log('Client loaded')

// Three.js setup
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
directionalLight.position.set(10, 10, 10)
scene.add(directionalLight)

// Add a reference cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
const cube = new THREE.Mesh(geometry, material)
cube.position.set(0, 0.5, -5)
scene.add(cube)

// Set up camera
camera.position.set(0, 5, 10)
controls.target.set(0, 0, 0)

// Load the model
const loader = new GLTFLoader()
loader.load('/worlds/vipe/assets/VIPERoom_132.glb', (gltf) => {
  const model = gltf.scene
  
  // Create a container for the model
  const container = new THREE.Group()
  container.position.set(0, 2, -5)
  container.scale.set(0.5, 0.5, 0.5)
  
  // Add the model to the container
  container.add(model)
  
  // Make sure all meshes are visible and cast shadows
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
      if (child.material) {
        child.material.side = THREE.DoubleSide
        child.material.needsUpdate = true
      }
    }
  })
  
  // Add the container to the scene
  scene.add(container)
  console.log('Model loaded successfully')
}, 
(progress) => {
  console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
},
(error) => {
  console.error('Error loading model:', error)
})

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()

// WebSocket connection
const ws = new WebSocket(`ws://${window.location.host}/ws`)

ws.onopen = () => {
  console.log('Connected to server')
}

ws.onmessage = (event) => {
  console.log('Received:', event.data)
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error)
}

ws.onclose = () => {
  console.log('Disconnected from server')
} 