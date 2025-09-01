// Collision.ts - Circle-circle detection
import * as THREE from 'three'
import type { Ship } from '../entities/Ship'
import type { Bullet } from '../entities/Bullet'
import type { Asteroid } from '../entities/Asteroid'
import type { BulletManager } from './BulletManager'
import type { Spawning } from './Spawning'
import type { GameState } from '../GameState'

export interface CollisionEvent {
  type: 'bullet-asteroid' | 'ship-asteroid'
  position: THREE.Vector2
  asteroidSize?: 'large' | 'medium' | 'small'
  damage?: number
}

export class CollisionManager {
  private bulletManager: BulletManager
  private spawning: Spawning
  private ship: Ship
  private gameState: GameState
  private scene: THREE.Scene
  
  constructor(
    bulletManager: BulletManager,
    spawning: Spawning,
    ship: Ship,
    gameState: GameState,
    scene: THREE.Scene
  ) {
    this.bulletManager = bulletManager
    this.spawning = spawning
    this.ship = ship
    this.gameState = gameState
    this.scene = scene
  }

  // Main collision detection method
  update(dt: number): CollisionEvent[] {
    const events: CollisionEvent[] = []
    
    // Check bullet-asteroid collisions
    const bulletAsteroidEvents = this.checkBulletAsteroidCollisions()
    events.push(...bulletAsteroidEvents)
    
    // Check ship-asteroid collisions
    const shipAsteroidEvents = this.checkShipAsteroidCollisions()
    events.push(...shipAsteroidEvents)
    
    return events
  }

  // Circle-circle collision detection
  private circleCollision(pos1: THREE.Vector2, radius1: number, pos2: THREE.Vector2, radius2: number): boolean {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < (radius1 + radius2)
  }

  // Check bullet-asteroid collisions
  private checkBulletAsteroidCollisions(): CollisionEvent[] {
    const events: CollisionEvent[] = []
    const bullets = this.bulletManager.getActiveBullets()
    const asteroids = this.spawning.getAsteroids()
    
    for (const bullet of bullets) {
      if (!bullet.isActive) continue
      
      const bulletPos = bullet.getPosition()
      const bulletRadius = bullet.mesh.userData.radius
      
      for (const asteroid of asteroids) {
        if (!asteroid.isAlive()) continue
        
        const asteroidPos = asteroid.getPosition()
        const asteroidRadius = asteroid.getRadius()
        
        if (this.circleCollision(bulletPos, bulletRadius, asteroidPos, asteroidRadius)) {
          // Handle collision
          const event = this.handleBulletAsteroidHit(bullet, asteroid)
          if (event) {
            events.push(event)
          }
          break // Bullet can only hit one asteroid
        }
      }
    }
    
    return events
  }

  // Check ship-asteroid collisions
  private checkShipAsteroidCollisions(): CollisionEvent[] {
    const events: CollisionEvent[] = []
    const asteroids = this.spawning.getAsteroids()
    
    if (!this.ship.object.userData.alive) return events
    
    const shipPos = this.ship.getPosition()
    const shipRadius = this.ship.object.userData.radius
    
    for (const asteroid of asteroids) {
      if (!asteroid.isAlive()) continue
      
      const asteroidPos = asteroid.getPosition()
      const asteroidRadius = asteroid.getRadius()
      
      if (this.circleCollision(shipPos, shipRadius, asteroidPos, asteroidRadius)) {
        // Handle collision
        const event = this.handleShipAsteroidHit(asteroid)
        if (event) {
          events.push(event)
        }
      }
    }
    
    return events
  }

  // Handle bullet hitting asteroid
  private handleBulletAsteroidHit(bullet: Bullet, asteroid: Asteroid): CollisionEvent | null {
    if (!bullet.isActive || !asteroid.isAlive()) return null
    
    const position = asteroid.getPosition()
    const size = asteroid.getSize()
    const score = asteroid.getScore()
    
    // Destroy bullet
    bullet.expire()
    
    // Damage asteroid
    asteroid.takeDamage()
    
    // Add score
    this.gameState.addScore(score)
    
    // Split asteroid if applicable
    const newAsteroids = this.spawning.splitAsteroid(asteroid)
    
    return {
      type: 'bullet-asteroid',
      position: position.clone(),
      asteroidSize: size
    }
  }

  // Handle ship hitting asteroid
  private handleShipAsteroidHit(asteroid: Asteroid): CollisionEvent | null {
    if (!asteroid.isAlive() || !this.ship.object.userData.alive) return null
    
    // Check if ship is invulnerable (implement invulnerability later if needed)
    const shipData = this.ship.object.userData
    if (shipData.invulnerable) return null
    
    const position = asteroid.getPosition()
    const size = asteroid.getSize()
    
    // Damage ship (implement ship damage system later)
    // For now, just create the event for particle effects
    
    return {
      type: 'ship-asteroid',
      position: position.clone(),
      asteroidSize: size,
      damage: 1
    }
  }
}