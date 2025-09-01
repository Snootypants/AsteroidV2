// GameCanvas.tsx - Three.js mount point with minimal PostFX integration
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createComposer, resize, render } from './render/PostFX'
import { Input } from './Input'
import { Ship } from './entities/Ship'
import { BulletManager } from './systems/BulletManager'
import { Spawning } from './systems/Spawning'
import { CollisionManager } from './systems/Collision'
import { ParticleManager } from './entities/Particles'
import { GameState } from './GameState'
import { createEnemyBullets } from './systems/EnemyBullets'
import { DevStats } from '../ui/DevPanel'
import { DebugBus } from '../dev/DebugBus'

// World constants (from vanilla)
const WORLD = {
  width: 750,
  height: 498,
}

// Pixel-perfect orthographic camera mapping
function makeOrthoCamera(w: number, h: number): THREE.OrthographicCamera {
  const halfW = w / 2, halfH = h / 2
  const cam = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 1000)
  cam.position.set(0, 0, 10)
  cam.lookAt(0, 0, 0)
  return cam
}

interface GameCanvasProps {
  onStats?: (stats: DevStats) => void
}

export default function GameCanvas({ onStats }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fpsHistoryRef = useRef<number[]>([])
  const shipRef = useRef<Ship | null>(null)
  const inputRef = useRef<Input | null>(null)
  const bulletManagerRef = useRef<BulletManager | null>(null)
  const spawningRef = useRef<Spawning | null>(null)
  const collisionManagerRef = useRef<CollisionManager | null>(null)
  const particleManagerRef = useRef<ParticleManager | null>(null)
  const gameStateRef = useRef<GameState | null>(null)
  const enemyBulletsRef = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Basic Three.js setup - placeholder for full game integration
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current })
    const scene = new THREE.Scene()
    const camera = makeOrthoCamera(window.innerWidth, window.innerHeight)
    
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    
    // Initialize game systems
    const input = new Input()
    const gameState = new GameState()
    const bulletManager = new BulletManager(scene)
    const ship = new Ship(scene, bulletManager)
    const spawning = new Spawning(scene)
    const particleManager = new ParticleManager(scene)
    const enemyBullets = createEnemyBullets(scene)
    const collisionManager = new CollisionManager(bulletManager, spawning, ship, gameState, scene)
    
    // Connect enemy bullets to collision manager
    collisionManager.setEnemyBullets(enemyBullets)
    
    shipRef.current = ship
    inputRef.current = input
    bulletManagerRef.current = bulletManager
    spawningRef.current = spawning
    collisionManagerRef.current = collisionManager
    particleManagerRef.current = particleManager
    gameStateRef.current = gameState
    enemyBulletsRef.current = enemyBullets
    
    // Initialize wave 1
    spawning.initializeWave(gameState.getWave())
    
    // Dev panel greeting
    DebugBus.push('info', 'DevPanel ready')
    
    // Initialize PostFX with default direct rendering (vanilla parity)
    createComposer(renderer, scene, camera, {
      width: window.innerWidth,
      height: window.innerHeight
    })

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      renderer.setPixelRatio(window.devicePixelRatio)
      
      // Update camera frustum to match new canvas size
      const halfW = width / 2, halfH = height / 2
      camera.left = -halfW
      camera.right = halfW
      camera.top = halfH
      camera.bottom = -halfH
      camera.updateProjectionMatrix()
      
      resize(width, height)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    // Screen to world coordinate conversion (1:1 pixel mapping)
    const screenToWorld = (screenX: number, screenY: number): THREE.Vector2 => {
      const rect = canvasRef.current!.getBoundingClientRect()
      // Convert to world coordinates (1 world unit = 1 CSS pixel)
      const worldX = screenX - rect.left - rect.width / 2
      const worldY = -(screenY - rect.top - rect.height / 2)
      
      return new THREE.Vector2(worldX, worldY)
    }

    // Game loop
    let raf = 0
    let last = performance.now()
    let statsUpdateCounter = 0
    const animate = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      
      // Calculate FPS (rolling average over 30 frames)
      const fps = dt > 0 ? 1 / dt : 0
      fpsHistoryRef.current.push(fps)
      if (fpsHistoryRef.current.length > 30) {
        fpsHistoryRef.current.shift()
      }
      const avgFps = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
      
      // Update input
      input.update()
      const inputState = input.getState()
      
      // Convert mouse screen coordinates to world coordinates
      const mouseWorld = screenToWorld(inputState.mouseX, inputState.mouseY)
      
      // Update ship
      ship.setAimWorld(mouseWorld)
      ship.update(dt, inputState)
      
      // Update bullets
      bulletManager.update(dt)
      
      // Update asteroids
      spawning.update(dt)
      
      // Update hunters (AI and firing)
      const hunters = spawning.getHunters()
      for (const hunter of hunters) {
        hunter.update(dt, ship.getPosition())
        
        // Check if hunter can fire
        if (hunter.canFire(performance.now())) {
          const firingAngle = hunter.getFiringAngle(ship.getPosition())
          enemyBullets.fire(hunter.getPosition(), firingAngle)
          hunter.markFired(performance.now())
        }
      }
      
      // Update enemy bullets
      enemyBullets.update(dt)
      
      // Update particles
      particleManager.update(dt)
      
      // Update collision detection and handle events
      const collisionEvents = collisionManager.update(dt)
      
      // Handle collision events (create particle effects)
      for (const event of collisionEvents) {
        if (event.type === 'bullet-asteroid' && event.asteroidSize) {
          particleManager.asteroidBurst(event.position, event.asteroidSize)
        } else if (event.type === 'ship-asteroid') {
          particleManager.shipBurst(event.position)
        } else if (event.type === 'enemy-bullet-ship') {
          particleManager.shipBurst(event.position)
        }
      }
      
      // Check for wave completion after collision updates
      if (gameState.getGamePhase() === 'playing' && spawning.isWaveComplete()) {
        gameState.completeWave()
      }
      
      // Handle wave transitions
      if (gameState.getGamePhase() === 'wave-complete') {
        // Start next wave automatically
        gameState.nextWave()
        ship.resetForWave()
        spawning.initializeWave(gameState.getWave())
      }
      
      // Follow ship with camera (simple following)
      const shipPos = ship.getPosition()
      camera.position.x = shipPos.x
      camera.position.y = shipPos.y
      
      render(dt) // Uses direct rendering by default (vanilla parity)
      
      // Update dev stats (throttled to ~10 Hz to avoid re-render spam)
      statsUpdateCounter++
      if (onStats && statsUpdateCounter % 6 === 0) {
        const shipPos = ship.getPosition()
        const shipUserData = ship.object.userData
        
        const stats: DevStats = {
          fps: avgFps,
          entities: { 
            ships: 1, 
            asteroids: spawning.getAsteroidCount(), 
            bullets: bulletManager.getActiveCount(), 
            other: particleManager.getActiveCount() + spawning.getHunterCount() + enemyBullets.getActiveCount() 
          },
          score: gameState.getScore(),
          wave: gameState.getWave(),
          ship: {
            x: shipPos.x,
            y: shipPos.y,
            vx: shipUserData.vx || 0,
            vy: shipUserData.vy || 0,
            angleDeg: (ship.object.rotation.z * 180 / Math.PI) % 360,
            pxHeight: 50 // Current ship size
          },
          input: {
            thrust: inputState.thrust,
            left: inputState.turnLeft,
            right: inputState.turnRight,
            fire: inputState.fire,
            mouseX: Math.round(inputState.mouseX),
            mouseY: Math.round(inputState.mouseY)
          }
        }
        
        onStats(stats)
      }
      
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} id="game-canvas" />
}