// GameCanvas.tsx - Three.js mount point with minimal PostFX integration
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createComposer, resize, render } from './render/PostFX'
import { Input } from './Input'
import { Ship } from './entities/Ship'

// World constants (from vanilla)
const WORLD = {
  width: 564,
  height: 498,
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Basic Three.js setup - placeholder for full game integration
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current })
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
      -WORLD.width/2, WORLD.width/2, 
      WORLD.height/2, -WORLD.height/2, 
      0.1, 1000
    )
    
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    
    // Position camera for 2D view
    camera.position.z = 5
    camera.lookAt(0, 0, 0)
    
    // Initialize game systems
    const input = new Input()
    const ship = new Ship(scene)
    
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
      resize(width, height)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    // Screen to world coordinate conversion
    const screenToWorld = (screenX: number, screenY: number): THREE.Vector2 => {
      // Convert screen coords to normalized device coordinates
      const rect = canvasRef.current!.getBoundingClientRect()
      const x = ((screenX - rect.left) / rect.width) * 2 - 1
      const y = -((screenY - rect.top) / rect.height) * 2 + 1
      
      // Convert to world coordinates using orthographic camera
      const worldX = x * WORLD.width / 2
      const worldY = y * WORLD.height / 2
      
      return new THREE.Vector2(worldX, worldY)
    }

    // Game loop
    let raf = 0
    let last = performance.now()
    const animate = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      
      // Update input
      input.update()
      const inputState = input.getState()
      
      // Convert mouse screen coordinates to world coordinates
      const mouseWorld = screenToWorld(inputState.mouseX, inputState.mouseY)
      
      // Update ship
      ship.setAimWorld(mouseWorld)
      ship.update(dt, inputState)
      
      // Follow ship with camera (simple following)
      const shipPos = ship.getPosition()
      camera.position.x = shipPos.x
      camera.position.y = shipPos.y
      
      render(dt) // Uses direct rendering by default (vanilla parity)
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