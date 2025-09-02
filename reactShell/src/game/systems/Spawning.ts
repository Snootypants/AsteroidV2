// Spawning.ts - Wave generation, enemy spawning
import * as THREE from 'three'
import { Asteroid, chooseOreType, type AsteroidSize, type OreType } from '../entities/Asteroid'
import { EnemyHunter } from '../entities/EnemyHunter'
import { WORLD_BOUNDS } from '../utils/units'

// Wave spawning constants (from vanilla)
const SPAWN_BUFFER = 20 // Units outside world bounds to spawn asteroids

export class Spawning {
  private scene: THREE.Scene
  private asteroids: Asteroid[] = []
  private hunters: EnemyHunter[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  // Spawn a single asteroid at a random position
  spawnAsteroid(size: AsteroidSize = 'large', oreType?: OreType): Asteroid {
    // Choose random ore type if not specified
    const finalOreType = oreType || chooseOreType()
    
    // Random position at world edges (avoid spawning on player)
    const edge = Math.floor(Math.random() * 4) // 0=top, 1=right, 2=bottom, 3=left
    let x: number, y: number
    
    const halfWidth = (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) / 2   // ±375
    const halfHeight = (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY) / 2 // ±249
    const margin = SPAWN_BUFFER // Spawn 20 units outside world bounds
    
    switch (edge) {
      case 0: // Top
        x = (Math.random() - 0.5) * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)
        y = halfHeight + margin
        break
      case 1: // Right
        x = halfWidth + margin
        y = (Math.random() - 0.5) * (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY)
        break
      case 2: // Bottom
        x = (Math.random() - 0.5) * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)
        y = -halfHeight - margin
        break
      case 3: // Left
      default:
        x = -halfWidth - margin
        y = (Math.random() - 0.5) * (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY)
        break
    }
    
    const asteroid = new Asteroid(this.scene, size, finalOreType, x, y)
    this.asteroids.push(asteroid)
    
    return asteroid
  }

  // Spawn multiple asteroids
  spawnAsteroids(count: number, size: AsteroidSize = 'large'): Asteroid[] {
    const spawned: Asteroid[] = []
    
    for (let i = 0; i < count; i++) {
      const asteroid = this.spawnAsteroid(size)
      spawned.push(asteroid)
    }
    
    return spawned
  }

  // Initialize level with starting asteroids (5-8 for testing)
  initializeLevel(): void {
    const count = 5 + Math.floor(Math.random() * 4) // 5-8 asteroids
    this.spawnAsteroids(count, 'large')
  }

  // Initialize wave with specified wave number
  initializeWave(waveNum: number): void {
    // Wave asteroid count formula: (3 + wave) × 2
    const asteroidCount = (3 + waveNum) * 2
    this.clearAll() // Clear any existing asteroids
    this.spawnAsteroids(asteroidCount, 'large')
    
    // Spawn hunters for wave ≥ 3
    if (waveNum >= 3) {
      this.spawnHunters(waveNum)
    }
  }

  // Add asteroid to tracking (for split asteroids)
  addAsteroid(asteroid: Asteroid): void {
    this.asteroids.push(asteroid)
  }

  // Remove asteroid from tracking
  removeAsteroid(asteroid: Asteroid): void {
    const index = this.asteroids.indexOf(asteroid)
    if (index !== -1) {
      this.asteroids.splice(index, 1)
      asteroid.destroy(this.scene)
    }
  }

  // Update all asteroids and hunters
  update(dt: number): void {
    // Update all asteroids
    for (const asteroid of this.asteroids) {
      if (asteroid.isAlive()) {
        asteroid.update(dt)
      }
    }
    
    // Clean up dead asteroids
    this.asteroids = this.asteroids.filter(asteroid => {
      if (!asteroid.isAlive()) {
        asteroid.destroy(this.scene)
        return false
      }
      return true
    })
    
    // Update hunters (they'll be updated from GameCanvas with ship position)
    // Just keep them alive for now - actual update happens in GameCanvas
  }

  // Split asteroid and manage the resulting pieces
  splitAsteroid(asteroid: Asteroid): Asteroid[] {
    if (!asteroid.isAlive()) return []
    
    const newAsteroids = asteroid.split(this.scene)
    
    // Add new asteroids to tracking
    for (const newAsteroid of newAsteroids) {
      this.addAsteroid(newAsteroid)
    }
    
    // Remove the original asteroid
    this.removeAsteroid(asteroid)
    
    return newAsteroids
  }

  // Get all active asteroids
  getAsteroids(): Asteroid[] {
    return this.asteroids.filter(asteroid => asteroid.isAlive())
  }

  // Get asteroid count
  getAsteroidCount(): number {
    return this.getAsteroids().length
  }

  // Check if level is clear (no asteroids left)
  isLevelClear(): boolean {
    return this.getAsteroidCount() === 0
  }

  // Check if wave is complete (all asteroids destroyed)
  isWaveComplete(): boolean {
    return this.getAsteroidCount() === 0
  }

  // Clear wave (cleanup between waves)
  clearWave(): void {
    this.clearAll()
  }

  // Clear all asteroids and hunters
  clearAll(): void {
    for (const asteroid of this.asteroids) {
      asteroid.destroy(this.scene)
    }
    this.asteroids = []
    
    for (const hunter of this.hunters) {
      this.scene.remove(hunter.object)
    }
    this.hunters = []
  }

  // Spawn hunters for wave ≥ 3
  private spawnHunters(waveNum: number): void {
    // count = Math.min(1 + Math.floor((wave - 2)/2), 4)
    const hunterCount = Math.min(1 + Math.floor((waveNum - 2) / 2), 4)
    
    for (let i = 0; i < hunterCount; i++) {
      // level = 1..n (affects speed scaling)
      const level = Math.min(waveNum - 2, 10) // Cap at level 10 for balance
      
      // Spawn outside world by 20 units buffer like asteroids
      const edge = Math.floor(Math.random() * 4) // 0=top, 1=right, 2=bottom, 3=left
      let x: number, y: number
      
      const halfWidth = (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) / 2   // ±375
      const halfHeight = (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY) / 2 // ±249
      const margin = SPAWN_BUFFER // 20 units outside world bounds
      
      switch (edge) {
        case 0: // Top
          x = (Math.random() - 0.5) * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)
          y = halfHeight + margin
          break
        case 1: // Right
          x = halfWidth + margin
          y = (Math.random() - 0.5) * (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY)
          break
        case 2: // Bottom
          x = (Math.random() - 0.5) * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)
          y = -halfHeight - margin
          break
        case 3: // Left
        default:
          x = -halfWidth - margin
          y = (Math.random() - 0.5) * (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY)
          break
      }
      
      const position = new THREE.Vector2(x, y)
      const hunter = EnemyHunter.create(level, position)
      this.hunters.push(hunter)
      this.scene.add(hunter.object)
    }
  }

  // Get all active hunters
  getHunters(): EnemyHunter[] {
    return this.hunters
  }

  // Get hunter count
  getHunterCount(): number {
    return this.hunters.length
  }

  // Remove hunter (for collision handling)
  removeHunter(hunter: EnemyHunter): void {
    const index = this.hunters.indexOf(hunter)
    if (index !== -1) {
      this.hunters.splice(index, 1)
      this.scene.remove(hunter.object)
    }
  }
}