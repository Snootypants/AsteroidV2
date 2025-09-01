// Ship.ts - Player ship
import * as THREE from 'three'
import type { InputState } from '../Input'
import type { BulletManager } from '../systems/BulletManager'
import type { GameState } from '../GameState'
import { pxToWorld, WORLD_BOUNDS } from '../utils/units'

// Constants from vanilla
const PLAYER = {
  accel: 40,
  maxSpeed: 40,
  friction: 0.98,
  turn: 3.2,
  fireRate: 0.16,
}

// Invulnerability periods (from vanilla constants)
const INVULN_WAVE = 3.0   // At wave start
const INVULN_SPAWN = 2.0  // After respawn
const INVULN_HIT = 1.0    // After taking damage


// Ship visual scale
const SHIP_DESIRED_PX = 50 // Target 50px height on screen
const ROTATION_OFFSET = -Math.PI / 2 // Ship sprite nose points "up" (+Y)

export class Ship {
  object: THREE.Object3D
  private velocity = new THREE.Vector2(0, 0)
  private fireCooldown = 0
  private minAimDistance = 20 // Minimum distance for mouse aiming
  private bulletManager?: BulletManager
  private gameState?: GameState
  private invulnerabilityTime = 0 // Invulnerability timer
  private shieldMesh?: THREE.Mesh // Shield visual sphere
  private flashTime = 0 // Ship flashing during invulnerability

  constructor(scene: THREE.Scene, bulletManager?: BulletManager, gameState?: GameState) {
    this.bulletManager = bulletManager
    this.gameState = gameState
    this.object = this.createShipMesh()
    this.object.userData = {
      kind: 'ship',
      vx: 0,
      vy: 0,
      rot: 0,
      alive: true,
      fireCooldown: 0,
      radius: 1.5,
      invulnerable: false
    }
    
    // Create shield visual
    this.createShieldVisual()
    scene.add(this.shieldMesh!)
    
    // Start at origin facing left (like vanilla)
    this.object.position.set(0, 0, 0)
    this.object.rotation.z = Math.PI // pointing left (flipped around)
    
    scene.add(this.object)
  }

  private createShipMesh(): THREE.Object3D {
    // Load ship texture
    const loader = new THREE.TextureLoader()
    const shipTexture = loader.load('assets/ship/ship.png', (texture) => {
      // Configure texture for proper alpha handling
      texture.colorSpace = THREE.SRGBColorSpace
      texture.magFilter = THREE.NearestFilter
      texture.minFilter = THREE.NearestFilter
      texture.generateMipmaps = false
      
      // Scale ship to world units based on target pixel height
      const imgH = texture.image?.height ?? SHIP_DESIRED_PX
      const imgW = texture.image?.width ?? SHIP_DESIRED_PX
      const aspectRatio = imgW / imgH
      
      // Convert target pixel height to world units (using window height as reference)
      const targetWorldHeight = pxToWorld(SHIP_DESIRED_PX, window.innerHeight)
      
      // Scale the mesh to achieve desired world size
      this.object.scale.set(targetWorldHeight * aspectRatio, targetWorldHeight, 1)
    })
    
    // Create ship geometry with texture (placeholder size will be scaled)
    const shipGeometry = new THREE.PlaneGeometry(1.0, 1.0)
    const shipMaterial = new THREE.MeshBasicMaterial({
      map: shipTexture,
      transparent: true,
      depthWrite: false,
      alphaTest: 0.5,
      side: THREE.DoubleSide
    })
    
    return new THREE.Mesh(shipGeometry, shipMaterial)
  }

  private createShieldVisual(): void {
    // Create transparent sphere around ship for shield visual (world units)
    const shieldRadius = 3.5 // World units, roughly ship size + buffer
    const shieldGeometry = new THREE.SphereGeometry(shieldRadius, 16, 12)
    const shieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      wireframe: false
    })
    
    this.shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial)
    this.shieldMesh.visible = false // Initially hidden
  }

  setAimWorld(target: THREE.Vector2): void {
    const pos = this.object.position
    const dx = target.x - pos.x
    const dy = target.y - pos.y
    const distance = Math.hypot(dx, dy)
    
    // Only update rotation if mouse is not too close to ship (vanilla behavior)
    if (distance > this.minAimDistance) {
      const angle = Math.atan2(dy, dx)
      this.object.rotation.z = angle + ROTATION_OFFSET
    }
  }

  update(dt: number, input: InputState): void {
    const s = this.object.userData

    // Handle manual turning when not using mouse aim
    if (input.turnLeft && !this.isMouseAimActive(input)) {
      this.object.rotation.z += PLAYER.turn * dt
    }
    if (input.turnRight && !this.isMouseAimActive(input)) {
      this.object.rotation.z -= PLAYER.turn * dt
    }

    // Thrust mechanics
    if (input.thrust) {
      // Ship mesh faces up, rotation.z is already the direction to move
      const shipDirection = this.object.rotation.z + Math.PI/2 // Convert ship rotation to movement direction
      const ax = Math.cos(shipDirection) * PLAYER.accel * dt
      const ay = Math.sin(shipDirection) * PLAYER.accel * dt
      
      s.vx += ax
      s.vy += ay
      this.velocity.set(s.vx, s.vy)
    }

    // Apply speed limits and friction
    const speed = this.velocity.length()
    if (speed > PLAYER.maxSpeed) {
      this.velocity.normalize().multiplyScalar(PLAYER.maxSpeed)
      s.vx = this.velocity.x
      s.vy = this.velocity.y
    }

    s.vx *= PLAYER.friction
    s.vy *= PLAYER.friction
    this.velocity.set(s.vx, s.vy)

    // Update position
    this.object.position.x += s.vx * dt
    this.object.position.y += s.vy * dt

    // World wrapping
    this.wrap()

    // Fire cooldown
    this.fireCooldown = Math.max(0, this.fireCooldown - dt)
    s.fireCooldown = this.fireCooldown

    // Invulnerability timer
    this.invulnerabilityTime = Math.max(0, this.invulnerabilityTime - dt)
    s.invulnerable = this.invulnerabilityTime > 0
    
    // Flash timer for visual feedback during invulnerability
    if (s.invulnerable) {
      this.flashTime += dt * 8 // Flash frequency
      const shipMaterial = (this.object as THREE.Mesh).material as THREE.MeshBasicMaterial
      shipMaterial.opacity = Math.abs(Math.sin(this.flashTime)) * 0.5 + 0.5
    } else {
      // Reset opacity when not invulnerable
      const shipMaterial = (this.object as THREE.Mesh).material as THREE.MeshBasicMaterial
      shipMaterial.opacity = 1.0
      this.flashTime = 0
    }
    
    // Update shield visual position and visibility
    this.updateShieldVisual()

    // Handle firing
    if (input.fire && this.canFire() && this.bulletManager) {
      this.bulletManager.fire(this, false) // false = not enemy bullet
      this.setFireCooldown()
    }
  }

  private isMouseAimActive(input: InputState): boolean {
    // For now, always use mouse aim (vanilla behavior)
    // Later this could be toggled based on game state
    return true
  }

  private wrap(): void {
    if (this.object.position.x > WORLD_BOUNDS.x) {
      this.object.position.x = -WORLD_BOUNDS.x
    } else if (this.object.position.x < -WORLD_BOUNDS.x) {
      this.object.position.x = WORLD_BOUNDS.x
    }
    
    if (this.object.position.y > WORLD_BOUNDS.y) {
      this.object.position.y = -WORLD_BOUNDS.y
    } else if (this.object.position.y < -WORLD_BOUNDS.y) {
      this.object.position.y = WORLD_BOUNDS.y
    }
  }

  getPosition(): THREE.Vector2 {
    return new THREE.Vector2(this.object.position.x, this.object.position.y)
  }

  // Utility method for firing (will be used later)
  canFire(): boolean {
    return this.fireCooldown <= 0
  }

  // Set fire cooldown after shooting
  setFireCooldown(): void {
    this.fireCooldown = PLAYER.fireRate
  }

  // Set ship pixel height for runtime tuning (converts to world units)
  setPixelHeight(px: number, viewportHeight: number): void {
    const targetWorldHeight = pxToWorld(px, viewportHeight)
    
    const material = (this.object as THREE.Mesh).material as THREE.MeshBasicMaterial
    if (material.map && material.map.image) {
      const texture = material.map
      const imgH = texture.image.height
      const imgW = texture.image.width
      const aspectRatio = imgW / imgH
      
      // Scale to target world height, maintaining aspect ratio
      this.object.scale.set(targetWorldHeight * aspectRatio, targetWorldHeight, 1)
    }
  }

  // Reset ship for new wave
  resetForWave(): void {
    // Reset position to center
    this.object.position.set(0, 0, 0)
    
    // Reset velocity
    this.velocity.set(0, 0)
    this.object.userData.vx = 0
    this.object.userData.vy = 0
    
    // Reset rotation to face left (like vanilla)
    this.object.rotation.z = Math.PI
    
    // Apply 3-second invulnerability
    this.invulnerabilityTime = INVULN_WAVE
    this.object.userData.invulnerable = true
  }

  // Check if ship is invulnerable
  isInvulnerable(): boolean {
    return this.invulnerabilityTime > 0
  }

  // Update shield visual
  private updateShieldVisual(): void {
    if (!this.shieldMesh) return
    
    // Position shield at ship location
    this.shieldMesh.position.copy(this.object.position)
    
    // Show shield if invulnerable or has shield charges
    const hasShields = this.gameState?.hasShields() ?? false
    const shouldShowShield = this.isInvulnerable() || hasShields
    this.shieldMesh.visible = shouldShowShield
  }

  // Take damage - check shields first, then activate hit invulnerability
  takeDamage(): boolean {
    if (this.isInvulnerable()) {
      return false // No damage taken due to invulnerability
    }
    
    // Check if shields can absorb damage
    if (this.gameState?.consumeShieldCharge()) {
      // Shield absorbed the damage - no invulnerability needed
      return false // No actual damage taken
    }
    
    // No shields - take damage and activate hit invulnerability
    this.invulnerabilityTime = INVULN_HIT
    this.object.userData.invulnerable = true
    
    return true // Damage taken
  }

  // Respawn ship with spawn invulnerability
  respawn(): void {
    // Reset position to center
    this.object.position.set(0, 0, 0)
    
    // Reset velocity
    this.velocity.set(0, 0)
    this.object.userData.vx = 0
    this.object.userData.vy = 0
    
    // Reset rotation to face left (like vanilla)
    this.object.rotation.z = Math.PI
    
    // Apply spawn invulnerability
    this.invulnerabilityTime = INVULN_SPAWN
    this.object.userData.invulnerable = true
    this.object.userData.alive = true
  }

  // Get shield mesh for scene management
  getShieldMesh(): THREE.Mesh | undefined {
    return this.shieldMesh
  }

  // Cleanup method for proper disposal
  dispose(): void {
    if (this.shieldMesh) {
      this.shieldMesh.removeFromParent()
      this.shieldMesh.geometry.dispose()
      ;(this.shieldMesh.material as THREE.Material).dispose()
    }
  }
}