// Asteroid.ts - Asteroid variants
import * as THREE from 'three'

// Constants from vanilla (lines 28-33)
const ASTEROIDS = {
  large: { r: 6, score: 20, next: 'medium', count: 2 },
  medium: { r: 3.5, score: 50, next: 'small', count: 2 },
  small: { r: 2.0, score: 100, next: null, count: 0 },
  baseSpeed: 8,
}

const WORLD = {
  width: 750,
  height: 498,
}

// Ore types with colors and probabilities (from lines 819-825)
export type OreType = 'iron' | 'gold' | 'platinum' | 'adamantium'
export type AsteroidSize = 'large' | 'medium' | 'small'

const ORE_COLORS: Record<OreType, number> = {
  iron: 0x808080,      // Gray
  gold: 0xFFD700,      // Gold/Yellow
  platinum: 0xC0C0C0,  // Silver
  adamantium: 0x9400D3 // Purple
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
  object: THREE.Mesh
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

  private createAsteroidMesh(): THREE.Mesh {
    const radius = ASTEROIDS[this.size].r
    const geometry = new THREE.SphereGeometry(radius, 8, 6) // Low poly for retro feel
    const material = new THREE.MeshBasicMaterial({ 
      color: ORE_COLORS[this.oreType],
      wireframe: false 
    })
    
    return new THREE.Mesh(geometry, material)
  }

  update(dt: number): void {
    if (!this.object.userData.alive) return
    
    // Update position
    this.object.position.x += this.velocity.x * dt
    this.object.position.y += this.velocity.y * dt
    
    // World wrapping at ±375×±249
    const halfWidth = WORLD.width / 2  // ±375
    const halfHeight = WORLD.height / 2 // ±249
    
    if (this.object.position.x > halfWidth) {
      this.object.position.x = -halfWidth
    } else if (this.object.position.x < -halfWidth) {
      this.object.position.x = halfWidth
    }
    
    if (this.object.position.y > halfHeight) {
      this.object.position.y = -halfHeight
    } else if (this.object.position.y < -halfHeight) {
      this.object.position.y = halfHeight
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
    this.object.geometry.dispose()
    if (Array.isArray(this.object.material)) {
      this.object.material.forEach((m: any) => m.dispose())
    } else {
      (this.object.material as any).dispose()
    }
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