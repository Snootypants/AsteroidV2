// Asteroid.ts - Asteroid variants
import * as THREE from 'three'
import { WORLD_BOUNDS } from '../utils/units'

// Constants from vanilla (lines 28-33)
const ASTEROIDS = {
  large: { r: 6, score: 20, next: 'medium', count: 2 },
  medium: { r: 3.5, score: 50, next: 'small', count: 2 },
  small: { r: 2.0, score: 100, next: null, count: 0 },
  baseSpeed: 8,
}


// Ore types with colors and probabilities (from lines 819-825)
export type OreType = 'iron' | 'gold' | 'platinum' | 'adamantium'
export type AsteroidSize = 'large' | 'medium' | 'small'

const ORE_COLORS: Record<OreType, number> = {
  iron: 0x9AA1A8,      // Updated iron color
  gold: 0xE3B341,      // Updated gold color
  platinum: 0xB9D3EE,  // Updated platinum color
  adamantium: 0x7FFFD4 // Updated adamantium color (aqua)
}

// Ore type probability function (lines 819-825)
export function chooseOreType(): OreType {
  const r = Math.random()
  if (r > 0.995) return 'adamantium'  // 0.5%
  if (r > 0.975) return 'platinum'    // 2.5%
  if (r > 0.9) return 'gold'          // 7%
  return 'iron'                       // 90%
}

export class Asteroid {
  object: THREE.Object3D
  private velocity = new THREE.Vector2(0, 0)
  private size: AsteroidSize
  private oreType: OreType
  private rotationSpeed: number

  constructor(scene: THREE.Scene, size: AsteroidSize, oreType: OreType, x = 0, y = 0) {
    this.size = size
    this.oreType = oreType
    this.rotationSpeed = (Math.random() - 0.5) * 2 // Random rotation speed
    
    this.object = this.createAsteroidMesh()
    this.object.position.set(x, y, 0)
    
    // Set random velocity based on baseSpeed
    const angle = Math.random() * Math.PI * 2
    const speed = ASTEROIDS.baseSpeed + (Math.random() - 0.5) * 4 // baseSpeed ± 2
    this.velocity.set(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    )
    
    // Store metadata
    this.object.userData = {
      kind: 'asteroid',
      size: this.size,
      oreType: this.oreType,
      radius: ASTEROIDS[size].r,
      score: ASTEROIDS[size].score,
      vx: this.velocity.x,
      vy: this.velocity.y,
      alive: true
    }
    
    scene.add(this.object)
  }

  private createAsteroidMesh(): THREE.Object3D {
    const radius = ASTEROIDS[this.size].r
    const group = new THREE.Group()
    
    // Create main disk (slightly larger disk behind for outline effect)
    const outlineGeometry = new THREE.CircleGeometry(radius * 1.1, 16)
    const outlineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333, // Dark outline color
      transparent: true,
      opacity: 0.8
    })
    const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial)
    outlineMesh.position.z = -0.01 // Place behind main disk
    group.add(outlineMesh)
    
    // Create main asteroid disk with enhanced brightness
    const geometry = new THREE.CircleGeometry(radius, 16)
    const baseColor = ORE_COLORS[this.oreType]
    const material = new THREE.MeshBasicMaterial({ 
      // Enhanced brightness instead of emissive (not supported by MeshBasicMaterial)
      color: new THREE.Color(baseColor).multiplyScalar(1.2), // Brighter color
      transparent: false
    })
    const mainMesh = new THREE.Mesh(geometry, material)
    group.add(mainMesh)
    
    return group
  }

  update(dt: number): void {
    if (!this.object.userData.alive) return
    
    // Update position
    this.object.position.x += this.velocity.x * dt
    this.object.position.y += this.velocity.y * dt
    
    // World wrapping at world bounds
    if (this.object.position.x > WORLD_BOUNDS.x) {
      this.object.position.x = -WORLD_BOUNDS.x
    } else if (this.object.position.x < -WORLD_BOUNDS.x) {
      this.object.position.x = WORLD_BOUNDS.x
    }
    
    if (this.object.position.y > WORLD_BOUNDS.y) {
      this.object.position.y = -WORLD_BOUNDS.y
    } else if (this.object.position.y < -WORLD_BOUNDS.y) {
      this.object.position.y = WORLD_BOUNDS.y
    }
    
    // Rotation
    this.object.rotation.z += this.rotationSpeed * dt
    
    // Update userData velocity for debugging
    this.object.userData.vx = this.velocity.x
    this.object.userData.vy = this.velocity.y
  }

  // Split asteroid into smaller pieces
  split(scene: THREE.Scene): Asteroid[] {
    if (!this.object.userData.alive) return []
    
    const config = ASTEROIDS[this.size]
    if (!config.next || config.count === 0) {
      return [] // Small asteroids don't split
    }
    
    const newSize = config.next as AsteroidSize
    const newAsteroids: Asteroid[] = []
    
    for (let i = 0; i < config.count; i++) {
      // Create new asteroid at current position with slight offset
      const offsetX = (Math.random() - 0.5) * 4
      const offsetY = (Math.random() - 0.5) * 4
      
      const newAsteroid = new Asteroid(
        scene, 
        newSize, 
        this.oreType, // Same ore type as parent
        this.object.position.x + offsetX,
        this.object.position.y + offsetY
      )
      
      newAsteroids.push(newAsteroid)
    }
    
    return newAsteroids
  }

  // Handle damage/collision
  takeDamage(): boolean {
    this.object.userData.alive = false
    return true
  }

  // Cleanup
  destroy(scene: THREE.Scene): void {
    this.object.userData.alive = false
    scene.remove(this.object)
    
    // Dispose of group children (outline and main disk)
    this.object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => m.dispose())
        } else {
          (child.material as any).dispose()
        }
      }
    })
  }

  // Getters
  getPosition(): THREE.Vector2 {
    return new THREE.Vector2(this.object.position.x, this.object.position.y)
  }

  getRadius(): number {
    return ASTEROIDS[this.size].r
  }

  getScore(): number {
    return ASTEROIDS[this.size].score
  }

  getSize(): AsteroidSize {
    return this.size
  }

  getOreType(): OreType {
    return this.oreType
  }

  isAlive(): boolean {
    return this.object.userData.alive
  }
}