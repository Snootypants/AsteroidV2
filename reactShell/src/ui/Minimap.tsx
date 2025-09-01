// Minimap.tsx - Tactical display showing entity positions
import { useEffect, useRef } from 'react'
import { MiniSnapshot } from '../game/GameCanvas'

interface MinimapProps {
  data: MiniSnapshot | null
  visible?: boolean
}

export default function Minimap({ data, visible = true }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || !visible) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 280
    canvas.height = 187

    // Calculate scaling from world coordinates to minimap coordinates
    // World: 750x498, Minimap: 280x187
    const scaleX = 280 / data.world.width
    const scaleY = 187 / data.world.height
    
    // Use the smaller scale to maintain aspect ratio
    const scale = Math.min(scaleX, scaleY)
    
    // Calculate offset to center the scaled world
    const scaledWorldWidth = data.world.width * scale
    const scaledWorldHeight = data.world.height * scale
    const offsetX = (280 - scaledWorldWidth) / 2
    const offsetY = (187 - scaledWorldHeight) / 2

    // Convert world coordinates to minimap coordinates
    const worldToMinimap = (worldX: number, worldY: number) => {
      // Convert from world coords (-375 to 375, -249 to 249) to minimap coords
      const normalizedX = (worldX + data.world.width / 2) * scale
      const normalizedY = (worldY + data.world.height / 2) * scale
      return {
        x: normalizedX + offsetX,
        y: normalizedY + offsetY
      }
    }

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, 280, 187)

    // Draw asteroids (gray/ore-tinted circles)
    ctx.fillStyle = '#808080'
    for (const asteroid of data.asteroids) {
      const pos = worldToMinimap(asteroid.x, asteroid.y)
      const radius = Math.max(1, asteroid.r * scale * 0.3) // Scale down radius for minimap
      
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw hunters (red dots)
    ctx.fillStyle = '#ff4444'
    for (const hunter of data.hunters) {
      const pos = worldToMinimap(hunter.x, hunter.y)
      const radius = Math.max(2, hunter.r * scale * 0.5) // Slightly larger than bullets
      
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw enemy bullets (red tiny dots)
    ctx.fillStyle = '#ff6666'
    for (const bullet of data.enemyBullets) {
      const pos = worldToMinimap(bullet.x, bullet.y)
      
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw player bullets (white tiny dots)
    ctx.fillStyle = '#ffffff'
    for (const bullet of data.bullets) {
      const pos = worldToMinimap(bullet.x, bullet.y)
      
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw ship (bright dot/triangle on top)
    const shipPos = worldToMinimap(data.ship.x, data.ship.y)
    
    // Draw ship as bright triangle
    ctx.fillStyle = '#00ffff'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    
    const shipSize = 3
    ctx.beginPath()
    // Triangle pointing up (ship direction would require rotation data)
    ctx.moveTo(shipPos.x, shipPos.y - shipSize)
    ctx.lineTo(shipPos.x - shipSize, shipPos.y + shipSize)
    ctx.lineTo(shipPos.x + shipSize, shipPos.y + shipSize)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

  }, [data, visible])

  if (!visible || !data) {
    return null
  }

  return (
    <div className="minimap-wrap">
      <div className="minimap-panel">
        <canvas 
          ref={canvasRef} 
          className="minimap-canvas"
          width={280}
          height={187}
        />
      </div>
    </div>
  )
}