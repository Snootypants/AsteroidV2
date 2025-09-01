// EnemyHunter.ts - Hunter AI with strafing behavior
import * as THREE from 'three'

// Constants from requirements
const HUNTER_RADIUS = 1.2
const HUNTER_ACCEL = 20
const HUNTER_MAX_SPEED = 26
const FIRE_RATE = 0.9 // seconds
const BULLET_SPEED = 55
const BULLET_LIFE = 1.6 // seconds
const PREFERRED_DISTANCE = 14 // strafing orbit distance
const SPEED_SCALING = 1.2 // multiplier per level

// World bounds for wrapping
const WORLD = {
  width: 750,
  height: 498,
}

// Sprite selection helper
class SpriteSelector {
  private static lastSprite: string | null = null
  private static availableSprites = [
    'assets/boss/boss1.png',
    'assets/boss/boss2.png', 
    'assets/boss/boss3.png',
    'assets/boss/boss4.png',
    'assets/boss/boss5.png',
    'assets/boss/boss6.png',
    'assets/boss/boss7.png',
    'assets/boss/boss8.png',
    'assets/boss/boss9.png',
    'assets/boss/boss10.png'
  ]

  static selectRandomSprite(): string {
    let candidates = [...this.availableSprites]
    
    // Remove last sprite to avoid immediate repeats
    if (this.lastSprite) {
      candidates = candidates.filter(sprite => sprite !== this.lastSprite)
    }
    
    const selected = candidates[Math.floor(Math.random() * candidates.length)]
    this.lastSprite = selected
    return selected
  }
}

export class EnemyHunter {
  object: THREE.Object3D
  radius: number
  level: number
  lastFireAt: number
  
  private velocity: THREE.Vector2
  private maxSpeed: number
  private fireRate: number
  
  constructor(level: number, pos: THREE.Vector2, spriteUrl: string) {
    this.level = level
    this.radius = HUNTER_RADIUS
    this.lastFireAt = 0
    this.velocity = new THREE.Vector2(0, 0)
    
    // Speed scaling per level
    this.maxSpeed = HUNTER_MAX_SPEED * Math.pow(SPEED_SCALING, level - 1)
    this.fireRate = FIRE_RATE
    
    // Create visual representation
    this.object = new THREE.Object3D()
    this.object.position.set(pos.x, pos.y, 0)
    
    // Create sprite mesh
    const loader = new THREE.TextureLoader()
    loader.load(spriteUrl, (texture) => {
      const material = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(material)
      
      // Scale sprite to appropriate size (roughly 24 units wide)
      sprite.scale.set(24, 24, 1)
      this.object.add(sprite)
    })
    
    // Store hunter data
    this.object.userData = {
      type: 'enemy-hunter',
      radius: this.radius,
      level: this.level,
      velocity: this.velocity
    }
  }
  
  // Strafing AI: maintain preferred distance while moving tangentially
  update(dt: number, shipPos: THREE.Vector2): void {
    const hunterPos = new THREE.Vector2(this.object.position.x, this.object.position.y)
    const toShip = shipPos.clone().sub(hunterPos)
    const distToShip = toShip.length()
    
    // Calculate desired movement
    let acceleration = new THREE.Vector2(0, 0)
    
    if (distToShip > 0) {
      // Normalize direction to ship
      const dirToShip = toShip.clone().normalize()
      
      // Distance-based behavior
      if (distToShip > PREFERRED_DISTANCE * 1.2) {
        // Too far: move toward ship
        acceleration = dirToShip.multiplyScalar(HUNTER_ACCEL)
      } else if (distToShip < PREFERRED_DISTANCE * 0.8) {
        // Too close: move away from ship
        acceleration = dirToShip.multiplyScalar(-HUNTER_ACCEL)
      } else {
        // At preferred distance: strafe tangentially
        const tangent = new THREE.Vector2(-dirToShip.y, dirToShip.x)
        // Add some randomness to strafing direction
        if (Math.random() < 0.01) {
          tangent.multiplyScalar(-1)
        }
        acceleration = tangent.multiplyScalar(HUNTER_ACCEL * 0.8)
        
        // Add slight attraction to maintain orbit
        const radialForce = dirToShip.multiplyScalar(HUNTER_ACCEL * 0.3)
        if (distToShip > PREFERRED_DISTANCE) {
          acceleration.add(radialForce)
        } else {
          acceleration.sub(radialForce)
        }
      }
    }
    
    // Apply acceleration
    this.velocity.add(acceleration.multiplyScalar(dt))
    
    // Limit velocity
    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.normalize().multiplyScalar(this.maxSpeed)
    }
    
    // Update position
    this.object.position.x += this.velocity.x * dt
    this.object.position.y += this.velocity.y * dt
    
    // World wrapping
    const halfWidth = WORLD.width / 2
    const halfHeight = WORLD.height / 2
    
    if (this.object.position.x > halfWidth) this.object.position.x = -halfWidth
    if (this.object.position.x < -halfWidth) this.object.position.x = halfWidth
    if (this.object.position.y > halfHeight) this.object.position.y = -halfHeight
    if (this.object.position.y < -halfHeight) this.object.position.y = halfHeight
    
    // Rotate to face movement direction (for visual appeal)
    if (this.velocity.length() > 0.1) {
      const angle = Math.atan2(this.velocity.y, this.velocity.x)
      this.object.rotation.z = angle
    }
  }
  
  canFire(now: number): boolean {
    return (now - this.lastFireAt) >= (this.fireRate * 1000)
  }
  
  // Get position as Vector2
  getPosition(): THREE.Vector2 {
    return new THREE.Vector2(this.object.position.x, this.object.position.y)
  }
  
  // Get firing angle (toward ship)
  getFiringAngle(shipPos: THREE.Vector2): number {
    const hunterPos = this.getPosition()
    const toShip = shipPos.clone().sub(hunterPos)
    return Math.atan2(toShip.y, toShip.x)
  }
  
  // Mark as fired
  markFired(now: number): void {
    this.lastFireAt = now
  }
  
  // Static factory method with automatic sprite selection
  static create(level: number, pos: THREE.Vector2): EnemyHunter {
    const spriteUrl = SpriteSelector.selectRandomSprite()
    return new EnemyHunter(level, pos, spriteUrl)
  }
}