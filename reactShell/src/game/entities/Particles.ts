// Particles.ts - Pooled particle system for hit/explosion bursts
import * as THREE from 'three'

export type BurstOpts = { 
  count: number; 
  color?: number; 
  speed?: number; 
  lifeMs?: number; 
  size?: number 
}

interface ParticleData {
  pos: THREE.Vector2
  vel: THREE.Vector2
  ttl: number
  maxTtl: number
  active: boolean
}

export function createParticles(scene: THREE.Scene) {
  const POOL_SIZE = 500 // Configurable, default 400-600 range
  const particlePool: ParticleData[] = []
  
  // Initialize the pool
  for (let i = 0; i < POOL_SIZE; i++) {
    particlePool.push({
      pos: new THREE.Vector2(),
      vel: new THREE.Vector2(),
      ttl: 0,
      maxTtl: 1000,
      active: false
    })
  }
  
  // Create geometry and material for batched rendering
  const positions = new Float32Array(POOL_SIZE * 3)
  const colors = new Float32Array(POOL_SIZE * 3)
  
  const geometry = new THREE.BufferGeometry()
  const positionAttribute = new THREE.BufferAttribute(positions, 3)
  const colorAttribute = new THREE.BufferAttribute(colors, 3)
  geometry.setAttribute('position', positionAttribute)
  geometry.setAttribute('color', colorAttribute)
  
  const material = new THREE.PointsMaterial({
    size: 3,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 1.0
  })
  
  const points = new THREE.Points(geometry, material)
  scene.add(points)

  function burst(pos: THREE.Vector2, opts: BurstOpts): void {
    const {
      count,
      color = 0xffffff,
      speed = 90, // Default 60-120 range
      lifeMs = 675, // Default 450-900ms range
      size = 2.5 // Default 2-3px range
    } = opts
    
    // Find inactive particles to use
    const inactiveParticles = particlePool.filter(p => !p.active)
    const particlesToUse = Math.min(count, inactiveParticles.length)
    
    for (let i = 0; i < particlesToUse; i++) {
      const particle = inactiveParticles[i]
      
      // Set position
      particle.pos.copy(pos)
      
      // Set random velocity in a burst pattern
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
      const randomSpeed = speed + (Math.random() - 0.5) * speed * 0.4
      particle.vel.set(
        Math.cos(angle) * randomSpeed,
        Math.sin(angle) * randomSpeed
      )
      
      // Set life and activate
      const lifeVariation = lifeMs + (Math.random() - 0.5) * lifeMs * 0.5
      particle.maxTtl = lifeVariation
      particle.ttl = lifeVariation
      particle.active = true
    }
    
    // Update material size if specified
    if (size !== material.size) {
      material.size = size
    }
  }

  function update(dt: number): void {
    let activeIndex = 0
    
    for (let i = 0; i < POOL_SIZE; i++) {
      const particle = particlePool[i]
      
      if (!particle.active) {
        continue
      }
      
      // Update position
      particle.pos.x += particle.vel.x * dt
      particle.pos.y += particle.vel.y * dt
      
      // Update life
      particle.ttl -= dt * 1000 // Convert dt to milliseconds
      
      if (particle.ttl <= 0) {
        particle.active = false
        continue
      }
      
      // Update render buffers for active particle
      const posIndex = activeIndex * 3
      const colorIndex = activeIndex * 3
      
      positions[posIndex] = particle.pos.x
      positions[posIndex + 1] = particle.pos.y
      positions[posIndex + 2] = 0
      
      // Fade out over lifetime
      const alpha = particle.ttl / particle.maxTtl
      colors[colorIndex] = alpha
      colors[colorIndex + 1] = alpha
      colors[colorIndex + 2] = alpha
      
      activeIndex++
    }
    
    // Update geometry attributes
    positionAttribute.needsUpdate = true
    colorAttribute.needsUpdate = true
    
    // Set draw range to only render active particles
    geometry.setDrawRange(0, activeIndex)
  }

  function activeCount(): number {
    return particlePool.filter(p => p.active).length
  }
  
  return {
    burst,
    update,
    activeCount
  }
}

// Legacy adapter class for backwards compatibility
export class ParticleManager {
  private particles: ReturnType<typeof createParticles>

  constructor(scene: THREE.Scene) {
    this.particles = createParticles(scene)
  }

  // Create particle burst at position (legacy method)
  burst(position: THREE.Vector2, color: number = 0xffffff, count: number = 8, speed: number = 30): void {
    this.particles.burst(position, { count, color, speed, lifeMs: 600 })
  }

  // Create asteroid destruction burst
  asteroidBurst(position: THREE.Vector2, asteroidSize: 'large' | 'medium' | 'small'): void {
    let color = 0x808080
    let count = 6
    let speed = 60
    
    switch (asteroidSize) {
      case 'large':
        color = 0xffffff
        count = 28 // Destroy burst
        speed = 90
        break
      case 'medium':
        color = 0xdddddd
        count = 18
        speed = 75
        break
      case 'small':
        color = 0xaaaaaa
        count = 12 // Hit burst
        speed = 60
        break
    }
    
    this.particles.burst(position, { count, color, speed, lifeMs: 750 })
  }

  // Create ship collision burst
  shipBurst(position: THREE.Vector2): void {
    this.particles.burst(position, { count: 12, color: 0xff4444, speed: 100, lifeMs: 600 })
  }

  // Update all particles
  update(dt: number): void {
    this.particles.update(dt)
  }

  // Get active particle count
  getActiveCount(): number {
    return this.particles.activeCount()
  }
}