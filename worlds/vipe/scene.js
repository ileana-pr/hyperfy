import * as THREE from 'three'

export class VIPEWorld {
  constructor(world) {
    this.world = world
  }

  async init() {
    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
    this.world.stage.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(10, 10, 10)
    this.world.stage.scene.add(directionalLight)

    try {
      // Add a simple cube as reference
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
      const cube = new THREE.Mesh(geometry, material)
      cube.position.set(0, 0.5, -5)
      this.world.stage.scene.add(cube)

      // Load the model
      console.log('Attempting to load model...')
      const modelPath = '/home/cheddarqueso/hyperfy/worlds/vipe/assets/VIPERoom_132.glb'
      console.log('Loading model from:', modelPath)
      
      // Load the model using the world's loader
      const result = await this.world.loader.load('glb', modelPath)
      console.log('Load result:', result)
      
      if (result && result.scene) {
        const model = result.scene
        console.log('Model loaded successfully')
        console.log('Model structure:', model)

        // Create a container for the model
        const container = new THREE.Group()
        
        // Position the container closer and higher
        container.position.set(0, 2, -5)  // Moved closer and up
        
        // Larger scale
        container.scale.set(0.5, 0.5, 0.5)  // Increased scale
        
        // Add the model to the container
        container.add(model)
        
        // Make sure all meshes are visible and cast shadows
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            // Ensure materials are properly configured
            if (child.material) {
              child.material.side = THREE.DoubleSide
              child.material.needsUpdate = true
            }
            console.log('Mesh found:', child.name)
          }
        })

        // Add the container to the scene
        this.world.stage.scene.add(container)
        
        // Store reference for updates
        this.modelContainer = container
        
        // Log scene structure
        console.log('Scene children:', this.world.stage.scene.children)
      } else {
        console.error('Model loaded but no scene found:', result)
      }
    } catch (error) {
      console.error('Full error details:', error)
      console.error('Error stack:', error.stack)
    }
  }

  update(delta) {
    if (this.modelContainer) {
      // Example: Slowly rotate the model
      // this.modelContainer.rotation.y += delta * 0.1
    }
  }
}