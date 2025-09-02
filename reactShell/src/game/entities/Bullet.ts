// Bullet.ts - Projectile system
import * as THREE from 'three'
import { WORLD_BOUNDS } from '../utils/units'

// Constants from vanilla
const BULLET = { 
  speed: 70, 
  life: 1.1, 
  r: 0.2 
}

// Default bullet visual size in pixels
const DEFAULT_BULLET_PX = 3

export class Bullet {
  mesh: THREE.Mesh
  private velocity = new THREE.Vector2(0, 0)
  private life = 0
  private maxLife = BULLET.life
  public isActive = false
  public isEnemy = false

  constructor() {
    // Create bullet visual with fixed radius scaling
    const radius = 0.28
    const geometry = new THREE.SphereGeometry(1, 8, 6)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xE6E6E6, // Brighter than pure white for better visibility
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.scale.set(2 * radius, 2 * radius, 2 * radius)
    this.mesh.userData = {
      kind: 'bullet',
      radius: radius
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
    if (this.mesh.position.x > WORLD_BOUNDS.x) {
      this.mesh.position.x = -WORLD_BOUNDS.x
    } else if (this.mesh.position.x < -WORLD_BOUNDS.x) {
      this.mesh.position.x = WORLD_BOUNDS.x
    }
    
    if (this.mesh.position.y > WORLD_BOUNDS.y) {
      this.mesh.position.y = -WORLD_BOUNDS.y
    } else if (this.mesh.position.y < -WORLD_BOUNDS.y) {
      this.mesh.position.y = WORLD_BOUNDS.y
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