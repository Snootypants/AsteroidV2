// BulletManager.ts - Manages all bullets with object pooling
import * as THREE from 'three'
import { Bullet } from '../entities/Bullet'
import type { Ship } from '../entities/Ship'

// Constants from vanilla
const BULLET = { 
  speed: 70, 
  life: 1.1, 
  r: 0.2 
}

export class BulletManager {
  private bullets: Bullet[] = []
  private scene: THREE.Scene
  private poolSize = 100 // Maximum bullets that can exist

  constructor(scene: THREE.Scene) {
    this.scene = scene
    
    // Pre-create bullet pool
    for (let i = 0; i < this.poolSize; i++) {
      const bullet = new Bullet()
      this.bullets.push(bullet)
      this.scene.add(bullet.mesh)
    }
  }

  fire(ship: Ship, isEnemy: boolean = false): Bullet | null {
    // Find an inactive bullet from the pool
    const bullet = this.bullets.find(b => !b.isActive)
    if (!bullet) {
      console.warn('BulletManager: No available bullets in pool')
      return null
    }

    // Get ship's position and rotation
    const shipPos = ship.getPosition()
    const shipRotation = ship.object.rotation.z
    
    // Calculate bullet spawn position at ship's nose
    const noseOffset = 2.0 // Distance from ship center to nose
    const noseX = shipPos.x + Math.cos(shipRotation + Math.PI/2) * noseOffset
    const noseY = shipPos.y + Math.sin(shipRotation + Math.PI/2) * noseOffset
    
    // Calculate bullet velocity direction (ship's facing direction)
    const bulletVelX = Math.cos(shipRotation + Math.PI/2) * BULLET.speed
    const bulletVelY = Math.sin(shipRotation + Math.PI/2) * BULLET.speed
    
    // Inherit ship's velocity (add to bullet velocity)
    const shipVel = ship.object.userData
    const totalVelX = bulletVelX + (shipVel.vx || 0)
    const totalVelY = bulletVelY + (shipVel.vy || 0)
    
    // Initialize the bullet
    bullet.reset(
      new THREE.Vector2(noseX, noseY),
      new THREE.Vector2(totalVelX, totalVelY),
      isEnemy
    )

    return bullet
  }

  update(dt: number): void {
    // Update all active bullets
    for (const bullet of this.bullets) {
      if (bullet.isActive) {
        bullet.update(dt)
      }
    }
  }

  getActiveBullets(): Bullet[] {
    return this.bullets.filter(b => b.isActive)
  }

  getActiveCount(): number {
    return this.bullets.filter(b => b.isActive).length
  }

  // Cleanup method
  dispose(): void {
    for (const bullet of this.bullets) {
      this.scene.remove(bullet.mesh)
      bullet.mesh.geometry.dispose()
      if (bullet.mesh.material instanceof THREE.Material) {
        bullet.mesh.material.dispose()
      }
    }
    this.bullets = []
  }
}