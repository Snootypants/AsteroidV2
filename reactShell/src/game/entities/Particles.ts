// Particles.ts - Particle system
import * as THREE from 'three'

interface Particle {
  mesh: THREE.Mesh
  velocity: THREE.Vector2
  life: number
  maxLife: number
  isActive: boolean
}

export class ParticleManager {
  private particles: Particle[] = []
  private scene: THREE.Scene
  private poolSize = 200 // Maximum particles that can exist

  constructor(scene: THREE.Scene) {
    this.scene = scene
    
    // Pre-create particle pool
    for (let i = 0; i < this.poolSize; i++) {
      const particle = this.createParticle()
      this.particles.push(particle)
      this.scene.add(particle.mesh)
    }
  }

  private createParticle(): Particle {
    // Create small colored sphere for particle visual
    const geometry = new THREE.SphereGeometry(0.5, 4, 3) // Very small, low-poly
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 1.0
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.visible = false
    
    return {
      mesh,
      velocity: new THREE.Vector2(0, 0),
      life: 0,
      maxLife: 1.0,
      isActive: false
    }
  }

  // Create particle burst at position
  burst(position: THREE.Vector2, color: number = 0xffffff, count: number = 8, speed: number = 30): void {
    const inactiveParticles = this.particles.filter(p => !p.isActive)
    const particlesToUse = Math.min(count, inactiveParticles.length)
    
    for (let i = 0; i < particlesToUse; i++) {
      const particle = inactiveParticles[i]
      
      // Set position
      particle.mesh.position.set(position.x, position.y, 0)
      
      // Set random velocity
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
      const randomSpeed = speed + (Math.random() - 0.5) * speed * 0.5
      particle.velocity.set(
        Math.cos(angle) * randomSpeed,
        Math.sin(angle) * randomSpeed
      )
      
      // Set properties
      particle.life = particle.maxLife
      particle.isActive = true
      particle.mesh.visible = true
      
      // Set color
      const material = particle.mesh.material as THREE.MeshBasicMaterial
      material.color.setHex(color)
      material.opacity = 1.0
    }
  }

  // Create asteroid destruction burst
  asteroidBurst(position: THREE.Vector2, asteroidSize: 'large' | 'medium' | 'small'): void {
    let color = 0x808080 // Default gray
    let count = 6
    let speed = 25
    
    switch (asteroidSize) {
      case 'large':
        color = 0xffffff
        count = 12
        speed = 35
        break
      case 'medium':
        color = 0xdddddd
        count = 8
        speed = 30
        break
      case 'small':
        color = 0xaaaaaa
        count = 6
        speed = 25
        break
    }
    
    this.burst(position, color, count, speed)
  }

  // Create ship collision burst
  shipBurst(position: THREE.Vector2): void {
    this.burst(position, 0xff4444, 10, 40) // Red particles for ship damage
  }

  // Update all particles
  update(dt: number): void {
    for (const particle of this.particles) {
      if (!particle.isActive) continue
      
      // Update position
      particle.mesh.position.x += particle.velocity.x * dt
      particle.mesh.position.y += particle.velocity.y * dt
      
      // Update life
      particle.life -= dt
      
      // Fade out
      const alpha = particle.life / particle.maxLife
      const material = particle.mesh.material as THREE.MeshBasicMaterial
      material.opacity = alpha
      
      // Deactivate if expired
      if (particle.life <= 0) {
        particle.isActive = false
        particle.mesh.visible = false
      }
    }
  }

  // Get active particle count
  getActiveCount(): number {
    return this.particles.filter(p => p.isActive).length
  }

  // Cleanup method
  dispose(): void {
    for (const particle of this.particles) {
      this.scene.remove(particle.mesh)
      particle.mesh.geometry.dispose()
      if (particle.mesh.material instanceof THREE.Material) {
        particle.mesh.material.dispose()
      }
    }
    this.particles = []
  }
}