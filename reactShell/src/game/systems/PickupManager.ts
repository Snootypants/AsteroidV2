// PickupManager.ts - Pickup system with object pooling
import * as THREE from 'three'
import { Pickup, type CurrencyType } from '../entities/Pickup'
import type { GameState } from '../GameState'

// Drop rates from vanilla analysis
const DROP_RATES = {
  gold: 0.27,        // 27% chance for gold ore asteroids
  platinum: 0.60,    // 60% chance for platinum ore asteroids  
  adamantium: 0.40,  // 40% chance for adamantium ore asteroids
  salvage: 1.00      // 100% chance for all asteroids
}

// Currency amounts per pickup
const CURRENCY_AMOUNTS = {
  salvage: 1,     // Base currency
  gold: 3,        // More valuable
  platinum: 8,    // Much more valuable
  adamantium: 20  // Most valuable
}

export class PickupManager {
  private scene: THREE.Scene
  private gameState: GameState
  private activePickups: Pickup[] = []
  private pickupPool: Pickup[] = [] // Object pool for performance
  private maxPoolSize: number = 50

  constructor(scene: THREE.Scene, gameState: GameState) {
    this.scene = scene
    this.gameState = gameState
  }

  // Spawn pickup at asteroid destruction location
  spawnPickup(position: THREE.Vector2, currencyType: CurrencyType, amount?: number): Pickup | null {
    // Use default amount if not specified
    const finalAmount = amount || CURRENCY_AMOUNTS[currencyType]
    
    // Try to get pickup from pool
    let pickup = this.pickupPool.pop()
    
    if (pickup) {
      // Reuse pooled pickup
      pickup.destroy(this.scene) // Clean up old state
      pickup = new Pickup(this.scene, currencyType, finalAmount, position.x, position.y)
    } else {
      // Create new pickup
      pickup = new Pickup(this.scene, currencyType, finalAmount, position.x, position.y)
    }
    
    this.activePickups.push(pickup)
    return pickup
  }

  // Spawn pickups based on asteroid ore type (handles drop rate logic)
  spawnPickupsForAsteroid(position: THREE.Vector2, oreType: 'iron' | 'gold' | 'platinum' | 'adamantium'): void {
    // Always spawn salvage
    this.spawnPickup(position, 'salvage')
    
    // Apply ore-specific drop rates for premium currencies
    let premiumCurrency: CurrencyType | null = null
    let dropRate = 0
    
    switch (oreType) {
      case 'gold':
        premiumCurrency = 'gold'
        dropRate = DROP_RATES.gold
        break
      case 'platinum':
        premiumCurrency = 'platinum'
        dropRate = DROP_RATES.platinum
        break
      case 'adamantium':
        premiumCurrency = 'adamantium'
        dropRate = DROP_RATES.adamantium
        break
      case 'iron':
      default:
        // Iron ore only drops salvage
        break
    }
    
    // Roll for premium currency drop
    if (premiumCurrency && Math.random() < dropRate) {
      // Add slight position offset to avoid overlap
      const offsetPosition = position.clone().add(new THREE.Vector2(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ))
      this.spawnPickup(offsetPosition, premiumCurrency)
    }
  }

  // Update all pickups
  update(dt: number, shipPosition: THREE.Vector2, magnetRadius: number): void {
    // Update all active pickups
    for (let i = this.activePickups.length - 1; i >= 0; i--) {
      const pickup = this.activePickups[i]
      
      // Update pickup (returns false if expired)
      const stillAlive = pickup.update(dt, shipPosition, magnetRadius)
      
      if (!stillAlive || !pickup.isAlive()) {
        // Remove from active list
        this.activePickups.splice(i, 1)
        
        // Return to pool if pool isn't full
        if (this.pickupPool.length < this.maxPoolSize) {
          this.pickupPool.push(pickup)
        } else {
          // Pool is full, destroy completely
          pickup.destroy(this.scene)
        }
        continue
      }
      
      // Check for collection
      if (pickup.canCollect(shipPosition)) {
        const collected = pickup.collect()
        this.addCurrencyToGameState(collected.type, collected.amount)
        
        // Remove from active list
        this.activePickups.splice(i, 1)
        
        // Return to pool
        if (this.pickupPool.length < this.maxPoolSize) {
          this.pickupPool.push(pickup)
        } else {
          pickup.destroy(this.scene)
        }
      }
    }
  }

  // Add collected currency to game state
  private addCurrencyToGameState(currencyType: CurrencyType, amount: number): void {
    this.gameState.addCurrency(currencyType, amount)
  }

  // Get all active pickups
  getActivePickups(): Pickup[] {
    return this.activePickups.filter(pickup => pickup.isAlive())
  }

  // Get active pickup count
  getActiveCount(): number {
    return this.getActivePickups().length
  }

  // Get total pickup count including pooled
  getTotalCount(): number {
    return this.activePickups.length + this.pickupPool.length
  }

  // Clear all pickups (for level transitions)
  clearAll(): void {
    // Destroy all active pickups
    for (const pickup of this.activePickups) {
      pickup.destroy(this.scene)
    }
    this.activePickups = []
    
    // Destroy all pooled pickups
    for (const pickup of this.pickupPool) {
      pickup.destroy(this.scene)
    }
    this.pickupPool = []
  }

  // Debug info
  getDebugInfo() {
    return {
      active: this.activePickups.length,
      pooled: this.pickupPool.length,
      total: this.getTotalCount()
    }
  }
}