// Debris.ts - Pooled tetrahedron debris system
import * as THREE from 'three'

interface DebrisData {
  pos: THREE.Vector2
  vel: THREE.Vector2
  angularVel: number
  ttl: number
  maxTtl: number
  active: boolean
  mesh: THREE.Mesh
}

export function createDebris(scene: THREE.Scene) {
  const POOL_SIZE = 220
  const debrisPool: DebrisData[] = []
  
  // Create shared geometry (single tetrahedron)
  const geometry = new THREE.TetrahedronGeometry(2.5, 0) // Small tetrahedron
  
  // Create shared material
  const material = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 1.0,
    wireframe: false
  })
  
  // Initialize pool with mesh instances
  for (let i = 0; i < POOL_SIZE; i++) {
    const mesh = new THREE.Mesh(geometry, material.clone()) // Clone material for individual opacity
    mesh.visible = false
    scene.add(mesh)
    
    debrisPool.push({
      pos: new THREE.Vector2(),
      vel: new THREE.Vector2(),
      angularVel: 0,
      ttl: 0,
      maxTtl: 1200,
      active: false,
      mesh
    })
  }
  
  function spawn(pos: THREE.Vector2, count: number, baseSpeed: number): void {
    // Find inactive debris to use
    const inactiveDebris = debrisPool.filter(d => !d.active)
    const debrisToUse = Math.min(count, inactiveDebris.length)
    
    for (let i = 0; i < debrisToUse; i++) {
      const debris = inactiveDebris[i]
      
      // Set position
      debris.pos.copy(pos)
      debris.mesh.position.set(pos.x, pos.y, 0)
      
      // Set random velocity
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 1.0
      const speed = baseSpeed + (Math.random() - 0.5) * baseSpeed * 0.8
      debris.vel.set(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      )
      
      // Set random angular velocity (small)
      debris.angularVel = (Math.random() - 0.5) * 3.0
      
      // Set random lifetime in the range 900-1400ms
      const lifeVariation = 1200 + (Math.random() - 0.5) * 500
      debris.maxTtl = lifeVariation
      debris.ttl = lifeVariation
      
      // Activate and make visible
      debris.active = true
      debris.mesh.visible = true
      
      // Reset material opacity
      const mat = debris.mesh.material as THREE.MeshBasicMaterial
      mat.opacity = 1.0
      
      // Random initial rotation
      debris.mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      )
    }
  }
  
  function update(dt: number): void {
    for (const debris of debrisPool) {
      if (!debris.active) continue
      
      // Update position
      debris.pos.x += debris.vel.x * dt
      debris.pos.y += debris.vel.y * dt
      debris.mesh.position.x = debris.pos.x
      debris.mesh.position.y = debris.pos.y
      
      // Update rotation
      debris.mesh.rotation.x += debris.angularVel * dt
      debris.mesh.rotation.y += debris.angularVel * dt * 0.7
      debris.mesh.rotation.z += debris.angularVel * dt * 0.5
      
      // Update lifetime
      debris.ttl -= dt * 1000 // Convert to milliseconds
      
      if (debris.ttl <= 0) {
        debris.active = false
        debris.mesh.visible = false
        continue
      }
      
      // Fade out over time
      const alpha = debris.ttl / debris.maxTtl
      const mat = debris.mesh.material as THREE.MeshBasicMaterial
      mat.opacity = alpha
    }
  }
  
  function activeCount(): number {
    return debrisPool.filter(d => d.active).length
  }
  
  return {
    spawn,
    update,
    activeCount
  }
}

// Legacy class wrapper for consistency
export class DebrisManager {
  private debris: ReturnType<typeof createDebris>
  
  constructor(scene: THREE.Scene) {
    this.debris = createDebris(scene)
  }
  
  spawn(pos: THREE.Vector2, count: number, baseSpeed: number): void {
    this.debris.spawn(pos, count, baseSpeed)
  }
  
  update(dt: number): void {
    this.debris.update(dt)
  }
  
  getActiveCount(): number {
    return this.debris.activeCount()
  }
}