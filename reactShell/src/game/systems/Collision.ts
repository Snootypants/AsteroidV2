// Collision.ts - Circle-circle detection
import * as THREE from 'three'
import type { Ship } from '../entities/Ship'
import type { Bullet } from '../entities/Bullet'
import type { Asteroid } from '../entities/Asteroid'
import type { BulletManager } from './BulletManager'
import type { Spawning } from './Spawning'
import type { GameState } from '../GameState'
import type { ParticleManager } from '../entities/Particles'
import type { DebrisManager } from '../entities/Debris'
import type { PickupManager } from './PickupManager'

export interface CollisionEvent {
  type: 'bullet-asteroid' | 'ship-asteroid' | 'enemy-bullet-ship'
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
  private particleManager: ParticleManager
  private debrisManager: DebrisManager
  private pickupManager: PickupManager | null = null
  private enemyBullets: any // EnemyBullets system will be injected
  
  constructor(
    bulletManager: BulletManager,
    spawning: Spawning,
    ship: Ship,
    gameState: GameState,
    scene: THREE.Scene,
    particleManager: ParticleManager,
    debrisManager: DebrisManager
  ) {
    this.bulletManager = bulletManager
    this.spawning = spawning
    this.ship = ship
    this.gameState = gameState
    this.scene = scene
    this.particleManager = particleManager
    this.debrisManager = debrisManager
    this.pickupManager = null
    this.enemyBullets = null
  }

  // Set enemy bullets system (will be called from GameCanvas)
  setEnemyBullets(enemyBullets: any): void {
    this.enemyBullets = enemyBullets
  }

  // Set pickup manager (will be called from GameCanvas)
  setPickupManager(pickupManager: PickupManager): void {
    this.pickupManager = pickupManager
  }

  // Main collision detection method
  update(dt: number): void {
    const events: CollisionEvent[] = []
    
    // Check bullet-asteroid collisions
    const bulletAsteroidEvents = this.checkBulletAsteroidCollisions()
    events.push(...bulletAsteroidEvents)
    
    // Check ship-asteroid collisions
    const shipAsteroidEvents = this.checkShipAsteroidCollisions()
    events.push(...shipAsteroidEvents)
    
    // Check enemy bullet-ship collisions (if enemy bullets system is available)
    if (this.enemyBullets) {
      const enemyBulletShipEvents = this.checkEnemyBulletShipCollisions()
      events.push(...enemyBulletShipEvents)
    }

    // Handle collision events (create particle and debris effects)
    for (const event of events) {
      if (event.type === 'bullet-asteroid' && event.asteroidSize) {
        this.particleManager.asteroidBurst(event.position, event.asteroidSize)
        
        // Spawn debris based on asteroid size
        this.spawnDebrisForAsteroid(event.position, event.asteroidSize)
      } else if (event.type === 'ship-asteroid') {
        // Only create ship explosion if actual damage was taken
        if (event.damage && event.damage > 0) {
          this.particleManager.shipBurst(event.position)
          this.debrisManager.spawn(event.position, 4, 50) // Small debris burst
        }
      } else if (event.type === 'enemy-bullet-ship') {
        // Only create ship explosion if actual damage was taken
        if (event.damage && event.damage > 0) {
          this.particleManager.shipBurst(event.position)
        }
      }
    }
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
        // Handle collision (ship.takeDamage() will handle invulnerability and shield checks)
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
    const oreType = asteroid.getOreType()
    
    // Destroy bullet
    bullet.expire()
    
    // Damage asteroid
    asteroid.takeDamage()
    
    // Add score
    this.gameState.addScore(score)
    
    // Spawn pickups based on ore type (if pickup manager is available)
    if (this.pickupManager) {
      this.pickupManager.spawnPickupsForAsteroid(position, oreType)
    }
    
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
    
    const position = asteroid.getPosition()
    const size = asteroid.getSize()
    
    // Attempt to damage the ship (handles invulnerability and shields internally)
    const damageTaken = this.ship.takeDamage()
    
    if (damageTaken) {
      // Ship took actual damage - lose a life
      this.gameState.loseLife()
      
      // If ship is dead, mark it as not alive
      if (this.gameState.isGameOver()) {
        this.ship.object.userData.alive = false
      } else {
        // Ship still has lives - respawn will be handled by game loop
      }
    }
    
    // Always return event for particle effects (even if damage was absorbed)
    return {
      type: 'ship-asteroid',
      position: position.clone(),
      asteroidSize: size,
      damage: damageTaken ? 1 : 0
    }
  }

  // Check enemy bullet-ship collisions
  private checkEnemyBulletShipCollisions(): CollisionEvent[] {
    const events: CollisionEvent[] = []
    
    if (!this.enemyBullets || !this.ship.object.userData.alive) return events
    
    const shipPos = this.ship.getPosition()
    const shipRadius = this.ship.object.userData.radius
    
    const enemyBullets = this.enemyBullets.getAll()
    
    for (const bulletData of enemyBullets) {
      if (this.circleCollision(bulletData.pos, bulletData.radius, shipPos, shipRadius)) {
        // Handle collision (ship.takeDamage() will handle invulnerability check)
        const event = this.handleEnemyBulletShipHit(bulletData)
        if (event) {
          events.push(event)
        }
      }
    }
    
    return events
  }

  // Handle enemy bullet hitting ship
  private handleEnemyBulletShipHit(bulletData: any): CollisionEvent | null {
    if (!this.ship.object.userData.alive) return null
    
    const shipPos = this.ship.getPosition()
    
    // Expire the enemy bullet
    this.enemyBullets.expire(bulletData.bullet)
    
    // Attempt to damage the ship (handles invulnerability and shields internally)
    const damageTaken = this.ship.takeDamage()
    
    if (damageTaken) {
      // Ship took actual damage - lose a life
      this.gameState.loseLife()
      
      // If ship is dead, mark it as not alive
      if (this.gameState.isGameOver()) {
        this.ship.object.userData.alive = false
      } else {
        // Ship still has lives - respawn will be handled by game loop
      }
    }
    
    return {
      type: 'enemy-bullet-ship',
      position: shipPos.clone(),
      damage: damageTaken ? 1 : 0
    }
  }
  
  // Spawn debris based on asteroid size
  private spawnDebrisForAsteroid(position: THREE.Vector2, size: 'large' | 'medium' | 'small'): void {
    let count = 6
    let speed = 40
    
    switch (size) {
      case 'large':
        count = 20
        speed = 60
        break
      case 'medium':
        count = 12
        speed = 50
        break
      case 'small':
        count = 6
        speed = 40
        break
    }
    
    this.debrisManager.spawn(position, count, speed)
  }
}