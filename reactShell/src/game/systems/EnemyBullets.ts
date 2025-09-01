// EnemyBullets.ts - Pooled enemy bullet system
import * as THREE from 'three'

// Constants from requirements
const BULLET_SPEED = 55
const BULLET_LIFE = 1.6 // seconds  
const BULLET_RADIUS = 1.5 // small radius for collisions
const POOL_SIZE = 50 // Maximum simultaneous enemy bullets

// World bounds for wrapping
const WORLD = {
  width: 750,
  height: 498,
}

interface EnemyBullet {
  mesh: THREE.Mesh
  velocity: THREE.Vector2
  timeToLive: number
  active: boolean
}

export function createEnemyBullets(scene: THREE.Scene) {
  const bullets: EnemyBullet[] = []
  
  // Pre-create bullet pool
  for (let i = 0; i < POOL_SIZE; i++) {
    const geometry = new THREE.CircleGeometry(BULLET_RADIUS, 8)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff4444, // Red color to distinguish from player bullets
      transparent: true,
      opacity: 0.9
    })
    const mesh = new THREE.Mesh(geometry, material)
    
    // Store bullet data
    mesh.userData = {
      type: 'enemy-bullet',
      radius: BULLET_RADIUS
    }
    
    const bullet: EnemyBullet = {
      mesh,
      velocity: new THREE.Vector2(0, 0),
      timeToLive: 0,
      active: false
    }
    
    bullets.push(bullet)
    scene.add(mesh)
    mesh.visible = false // Start invisible
  }
  
  return {
    // Fire a bullet from position at angle
    fire(from: THREE.Vector2, angleRad: number): void {
      // Find inactive bullet in pool
      const bullet = bullets.find(b => !b.active)
      if (!bullet) return // Pool exhausted
      
      // Activate bullet
      bullet.active = true
      bullet.timeToLive = BULLET_LIFE
      bullet.mesh.visible = true
      
      // Set position
      bullet.mesh.position.set(from.x, from.y, 0)
      
      // Set velocity
      bullet.velocity.set(
        Math.cos(angleRad) * BULLET_SPEED,
        Math.sin(angleRad) * BULLET_SPEED
      )
    },
    
    // Update all active bullets
    update(dt: number): void {
      for (const bullet of bullets) {
        if (!bullet.active) continue
        
        // Update lifetime
        bullet.timeToLive -= dt
        if (bullet.timeToLive <= 0) {
          // Expire bullet
          bullet.active = false
          bullet.mesh.visible = false
          continue
        }
        
        // Update position
        bullet.mesh.position.x += bullet.velocity.x * dt
        bullet.mesh.position.y += bullet.velocity.y * dt
        
        // World wrapping
        const halfWidth = WORLD.width / 2
        const halfHeight = WORLD.height / 2
        
        if (bullet.mesh.position.x > halfWidth) {
          bullet.mesh.position.x = -halfWidth
        } else if (bullet.mesh.position.x < -halfWidth) {
          bullet.mesh.position.x = halfWidth
        }
        
        if (bullet.mesh.position.y > halfHeight) {
          bullet.mesh.position.y = -halfHeight
        } else if (bullet.mesh.position.y < -halfHeight) {
          bullet.mesh.position.y = halfHeight
        }
      }
    },
    
    // Get all active bullets for collision detection
    getAll(): { pos: THREE.Vector2; radius: number; object: THREE.Object3D; bullet: EnemyBullet }[] {
      return bullets
        .filter(b => b.active)
        .map(b => ({
          pos: new THREE.Vector2(b.mesh.position.x, b.mesh.position.y),
          radius: BULLET_RADIUS,
          object: b.mesh,
          bullet: b
        }))
    },
    
    // Expire a specific bullet (for collision handling)
    expire(bullet: EnemyBullet): void {
      bullet.active = false
      bullet.mesh.visible = false
    },
    
    // Get active count for stats
    getActiveCount(): number {
      return bullets.filter(b => b.active).length
    }
  }
}