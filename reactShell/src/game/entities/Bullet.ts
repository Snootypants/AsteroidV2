// Bullet.ts - Projectile system
import * as THREE from 'three'

// Constants from vanilla
const BULLET = { 
  speed: 70, 
  life: 1.1, 
  r: 0.2 
}

const WORLD = {
  width: 750,
  height: 498,
}

export class Bullet {
  mesh: THREE.Mesh
  private velocity = new THREE.Vector2(0, 0)
  private life = 0
  private maxLife = BULLET.life
  public isActive = false
  public isEnemy = false

  constructor() {
    // Create brighter, more visible bullet visual
    // Use slightly larger visual size (2-3px equivalent) while keeping collision radius unchanged
    const visualRadius = 1.0 // Larger visual size for better visibility
    const geometry = new THREE.SphereGeometry(visualRadius, 8, 6)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xE6E6E6 // Brighter than pure white for better visibility on dark backgrounds
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.userData = {
      kind: 'bullet',
      radius: BULLET.r // Keep original collision radius
    }
  }

  // Initialize/reset bullet for object pooling
  reset(position: THREE.Vector2, velocity: THREE.Vector2, isEnemy: boolean = false): void {
    this.mesh.position.set(position.x, position.y, 0)
    this.velocity.copy(velocity)
    this.life = this.maxLife
    this.isActive = true
    this.isEnemy = isEnemy
    this.mesh.visible = true
  }

  update(dt: number): void {
    if (!this.isActive) return

    // Update position
    this.mesh.position.x += this.velocity.x * dt
    this.mesh.position.y += this.velocity.y * dt

    // Handle world wrapping
    this.wrap()

    // Update life timer
    this.life -= dt
    if (this.life <= 0) {
      this.expire()
    }
  }

  private wrap(): void {
    const halfWidth = WORLD.width / 2  // ±375
    const halfHeight = WORLD.height / 2 // ±249
    
    if (this.mesh.position.x > halfWidth) {
      this.mesh.position.x = -halfWidth
    } else if (this.mesh.position.x < -halfWidth) {
      this.mesh.position.x = halfWidth
    }
    
    if (this.mesh.position.y > halfHeight) {
      this.mesh.position.y = -halfHeight
    } else if (this.mesh.position.y < -halfHeight) {
      this.mesh.position.y = halfHeight
    }
  }

  isExpired(): boolean {
    return !this.isActive
  }

  expire(): void {
    this.isActive = false
    this.mesh.visible = false
  }

  getPosition(): THREE.Vector2 {
    return new THREE.Vector2(this.mesh.position.x, this.mesh.position.y)
  }
}