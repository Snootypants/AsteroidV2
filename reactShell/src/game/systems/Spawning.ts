// Spawning.ts - Wave generation, enemy spawning
import * as THREE from 'three'
import { Asteroid, chooseOreType, type AsteroidSize, type OreType } from '../entities/Asteroid'

const WORLD = {
  width: 750,
  height: 498,
}

export class Spawning {
  private scene: THREE.Scene
  private asteroids: Asteroid[] = []

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
    
    const halfWidth = WORLD.width / 2   // ±375
    const halfHeight = WORLD.height / 2 // ±249
    const margin = 50 // Spawn outside visible area
    
    switch (edge) {
      case 0: // Top
        x = (Math.random() - 0.5) * WORLD.width
        y = halfHeight + margin
        break
      case 1: // Right
        x = halfWidth + margin
        y = (Math.random() - 0.5) * WORLD.height
        break
      case 2: // Bottom
        x = (Math.random() - 0.5) * WORLD.width
        y = -halfHeight - margin
        break
      case 3: // Left
      default:
        x = -halfWidth - margin
        y = (Math.random() - 0.5) * WORLD.height
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

  // Update all asteroids
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

  // Clear all asteroids
  clearAll(): void {
    for (const asteroid of this.asteroids) {
      asteroid.destroy(this.scene)
    }
    this.asteroids = []
  }
}