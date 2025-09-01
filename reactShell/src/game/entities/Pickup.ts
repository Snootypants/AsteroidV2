// Pickup.ts - Currency pickup entities
import * as THREE from 'three'

export type CurrencyType = 'salvage' | 'gold' | 'platinum' | 'adamantium'

// Currency pickup colors and properties
const CURRENCY_COLORS: Record<CurrencyType, number> = {
  salvage: 0x808080,    // Gray
  gold: 0xFFD700,       // Yellow/Gold
  platinum: 0xC0C0C0,   // Silver
  adamantium: 0x9400D3  // Purple
}

// Pickup constants
const PICKUP_CONFIG = {
  size: 1.2,           // Base pickup size
  floatHeight: 8,      // Height of floating animation
  floatSpeed: 2.5,     // Speed of floating animation
  ttl: 10.0,           // Auto-collect timeout in seconds
  magneticSpeed: 120,  // Speed when attracted to ship
  collectionRadius: 2  // Direct collection radius
}

export class Pickup {
  object: THREE.Mesh
  private currencyType: CurrencyType
  private amount: number
  private lifetime: number = 0
  private floatOffset: number
  private isBeingAttracted: boolean = false
  private velocity = new THREE.Vector2(0, 0)

  constructor(scene: THREE.Scene, currencyType: CurrencyType, amount: number, x: number, y: number) {
    this.currencyType = currencyType
    this.amount = amount
    this.floatOffset = Math.random() * Math.PI * 2 // Random float phase
    
    this.object = this.createPickupMesh()
    this.object.position.set(x, y, 0)
    
    // Store metadata
    this.object.userData = {
      kind: 'pickup',
      currencyType: this.currencyType,
      amount: this.amount,
      alive: true
    }
    
    scene.add(this.object)
  }

  private createPickupMesh(): THREE.Mesh {
    // Create a small cube with slightly rounded edges for visual appeal
    const geometry = new THREE.BoxGeometry(PICKUP_CONFIG.size, PICKUP_CONFIG.size, PICKUP_CONFIG.size)
    const material = new THREE.MeshBasicMaterial({ 
      color: CURRENCY_COLORS[this.currencyType],
      transparent: true,
      opacity: 0.9
    })
    
    return new THREE.Mesh(geometry, material)
  }

  update(dt: number, shipPosition?: THREE.Vector2, magnetRadius: number = 0): boolean {
    if (!this.object.userData.alive) return false
    
    this.lifetime += dt
    
    // Auto-collect timeout
    if (this.lifetime >= PICKUP_CONFIG.ttl) {
      this.object.userData.alive = false
      return false
    }
    
    // Check for magnetic attraction
    if (shipPosition && magnetRadius > 0) {
      const pickupPos = new THREE.Vector2(this.object.position.x, this.object.position.y)
      const distanceToShip = pickupPos.distanceTo(shipPosition)
      
      if (distanceToShip <= magnetRadius) {
        this.isBeingAttracted = true
        
        // Move towards ship
        const direction = shipPosition.clone().sub(pickupPos).normalize()
        this.velocity = direction.multiplyScalar(PICKUP_CONFIG.magneticSpeed)
        
        // Update position based on magnetic attraction
        this.object.position.x += this.velocity.x * dt
        this.object.position.y += this.velocity.y * dt
      } else {
        this.isBeingAttracted = false
        this.velocity.set(0, 0)
      }
    }
    
    // Floating animation (only when not being attracted)
    if (!this.isBeingAttracted) {
      const floatY = Math.sin(this.lifetime * PICKUP_CONFIG.floatSpeed + this.floatOffset) * 0.5
      this.object.position.y += floatY * dt * PICKUP_CONFIG.floatHeight
    }
    
    // Gentle rotation for visual appeal
    this.object.rotation.y += dt * 2
    this.object.rotation.x += dt * 1.5
    
    // Fade effect as TTL approaches
    const fadeStart = PICKUP_CONFIG.ttl * 0.7 // Start fading at 70% of TTL
    if (this.lifetime >= fadeStart) {
      const fadeProgress = (this.lifetime - fadeStart) / (PICKUP_CONFIG.ttl - fadeStart)
      const opacity = 0.9 * (1 - fadeProgress)
      ;(this.object.material as THREE.MeshBasicMaterial).opacity = Math.max(opacity, 0.1)
    }
    
    return true // Still alive
  }

  // Check if pickup can be collected by ship
  canCollect(shipPosition: THREE.Vector2): boolean {
    if (!this.object.userData.alive) return false
    
    const pickupPos = new THREE.Vector2(this.object.position.x, this.object.position.y)
    const distance = pickupPos.distanceTo(shipPosition)
    
    return distance <= PICKUP_CONFIG.collectionRadius
  }

  // Collect the pickup
  collect(): { type: CurrencyType, amount: number } {
    this.object.userData.alive = false
    return {
      type: this.currencyType,
      amount: this.amount
    }
  }

  // Cleanup
  destroy(scene: THREE.Scene): void {
    this.object.userData.alive = false
    scene.remove(this.object)
    this.object.geometry.dispose()
    if (Array.isArray(this.object.material)) {
      this.object.material.forEach((m: any) => m.dispose())
    } else {
      (this.object.material as any).dispose()
    }
  }

  // Getters
  getPosition(): THREE.Vector2 {
    return new THREE.Vector2(this.object.position.x, this.object.position.y)
  }

  getCurrencyType(): CurrencyType {
    return this.currencyType
  }

  getAmount(): number {
    return this.amount
  }

  isAlive(): boolean {
    return this.object.userData.alive
  }

  getLifetime(): number {
    return this.lifetime
  }

  getTTL(): number {
    return PICKUP_CONFIG.ttl
  }
}