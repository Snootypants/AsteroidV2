// BulletManager.ts - Manage all bullets with object pooling
import * as THREE from 'three'
import { Bullet } from '../entities/Bullet'
import { Ship } from '../entities/Ship'

// Constants from vanilla
const BULLET = { 
  speed: 70, 
  life: 1.1, 
  r: 0.2 
}

export class BulletManager {
  private bullets: Bullet[] = []
  private activeBullets: Bullet[] = []
  private scene: THREE.Scene
  private poolSize = 50 // Pre-allocate bullet pool

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.initializePool()
  }

  private initializePool(): void {
    // Pre-create bullet pool for performance
    for (let i = 0; i < this.poolSize; i++) {
      const bullet = new Bullet()
      bullet.mesh.visible = false
      this.bullets.push(bullet)
      this.scene.add(bullet.mesh)
    }
  }

  // Fire a bullet from the ship
  fire(ship: Ship, isEnemy: boolean = false): void {
    // Find an inactive bullet from the pool
    const bullet = this.bullets.find(b => !b.isActive)
    if (!bullet) {
      console.warn('Bullet pool exhausted!')
      return
    }

    // Calculate firing position at ship nose
    const shipPos = ship.getPosition()
    const shipRotation = ship.object.rotation.z
    
    // Ship nose position (offset from center in ship's facing direction)
    const noseDistance = 25 // Distance from ship center to nose
    const noseX = shipPos.x + Math.cos(shipRotation + Math.PI/2) * noseDistance
    const noseY = shipPos.y + Math.sin(shipRotation + Math.PI/2) * noseDistance
    
    const firePosition = new THREE.Vector2(noseX, noseY)

    // Calculate bullet velocity (ship direction + ship velocity inheritance)
    const bulletDirection = new THREE.Vector2(
      Math.cos(shipRotation + Math.PI/2),
      Math.sin(shipRotation + Math.PI/2)
    )
    
    // Get ship velocity from userData
    const shipVelocity = new THREE.Vector2(
      ship.object.userData.vx || 0,
      ship.object.userData.vy || 0
    )
    
    // Bullet velocity = ship velocity + bullet speed in firing direction
    const bulletVelocity = new THREE.Vector2()
      .copy(shipVelocity)
      .add(bulletDirection.multiplyScalar(BULLET.speed))

    // Initialize the bullet
    bullet.reset(firePosition, bulletVelocity, isEnemy)
    
    // Add to active bullets list
    if (!this.activeBullets.includes(bullet)) {
      this.activeBullets.push(bullet)
    }
  }

  update(dt: number): void {
    // Update all active bullets
    for (let i = this.activeBullets.length - 1; i >= 0; i--) {
      const bullet = this.activeBullets[i]
      bullet.update(dt)
      
      // Remove expired bullets from active list
      if (bullet.isExpired()) {
        this.activeBullets.splice(i, 1)
      }
    }
  }

  getActiveBullets(): Bullet[] {
    return this.activeBullets.slice() // Return a copy
  }

  getActiveBulletCount(): number {
    return this.activeBullets.length
  }

  // Clear all bullets (for game reset)
  clear(): void {
    this.activeBullets.forEach(bullet => bullet.expire())
    this.activeBullets.length = 0
  }
}