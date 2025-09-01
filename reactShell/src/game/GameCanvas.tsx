// GameCanvas.tsx - Three.js mount point with minimal PostFX integration
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createComposer, resize, render } from './render/PostFX'
import { Input } from './Input'
import { Ship } from './entities/Ship'
import { BulletManager } from './systems/BulletManager'
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
    const bulletManager = new BulletManager(scene)
    const ship = new Ship(scene, bulletManager)
    
    shipRef.current = ship
    inputRef.current = input
    bulletManagerRef.current = bulletManager
    
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
            asteroids: 0, 
            bullets: bulletManager.getActiveBulletCount(), 
            other: 0 
          },
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