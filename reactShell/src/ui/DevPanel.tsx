import React, { useEffect, useState } from 'react'
import { DebugBus, LogEntry } from '../dev/DebugBus'

export type DevStats = {
  fps: number
  entities: { ships: number; asteroids: number; bullets: number; particles?: number; debris?: number; pickups?: number; other: number }
  score?: number
  wave?: number
  ship?: { x: number; y: number; vx: number; vy: number; angleDeg: number; pxHeight: number }
  input?: { thrust: boolean; left: boolean; right: boolean; fire: boolean; mouseX: number; mouseY: number }
}

interface DevPanelProps {
  visible: boolean
  stats: DevStats
}

export function DevPanel({ visible, stats }: DevPanelProps): JSX.Element | null {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    if (!visible) return
    
    const unsubscribe = DebugBus.subscribe(setLogs)
    return unsubscribe
  }, [visible])

  const handleClearLogs = () => {
    DebugBus.clear()
  }

  const handleCopyLogs = async () => {
    const logText = logs.map(entry => {
      const time = new Date(entry.t).toLocaleTimeString()
      return `[${time}] ${entry.level.toUpperCase()}: ${entry.msg}`
    }).join('\n')
    
    try {
      await navigator.clipboard.writeText(logText)
      DebugBus.push('info', 'Logs copied to clipboard')
    } catch {
      DebugBus.push('warn', 'Failed to copy logs to clipboard')
    }
  }

  if (!visible) return null

  return (
    <div className="dev-panel">
      <h4>Dev Panel</h4>
      
      {/* FPS and Entities */}
      <div className="sec">
        <div className="row">
          <span>FPS:</span>
          <span>{stats.fps.toFixed(1)}</span>
        </div>
        <div className="row">
          <span>Entities:</span>
          <span>
            Ships:{stats.entities.ships}
            Asteroids:{stats.entities.asteroids}
            Bullets:{stats.entities.bullets}
            {stats.entities.particles !== undefined && ` Particles:${stats.entities.particles}`}
            {stats.entities.debris !== undefined && ` Debris:${stats.entities.debris}`}
            {stats.entities.pickups !== undefined && ` Pickups:${stats.entities.pickups}`}
            {stats.entities.other > 0 && ` Other:${stats.entities.other}`}
          </span>
        </div>
        {stats.score !== undefined && (
          <div className="row">
            <span>Score:</span>
            <span>{stats.score}</span>
          </div>
        )}
        {stats.wave !== undefined && (
          <div className="row">
            <span>Wave:</span>
            <span>{stats.wave}</span>
          </div>
        )}
      </div>

      {/* Ship Stats */}
      {stats.ship && (
        <div className="sec">
          <h4>Ship</h4>
          <div className="row">
            <span>Position:</span>
            <span>x:{stats.ship.x.toFixed(1)} y:{stats.ship.y.toFixed(1)}</span>
          </div>
          <div className="row">
            <span>Velocity:</span>
            <span>vx:{stats.ship.vx.toFixed(2)} vy:{stats.ship.vy.toFixed(2)}</span>
          </div>
          <div className="row">
            <span>Angle:</span>
            <span>{stats.ship.angleDeg.toFixed(1)}°</span>
          </div>
          <div className="row">
            <span>Size:</span>
            <span>{stats.ship.pxHeight}px</span>
          </div>
        </div>
      )}

      {/* Input Stats */}
      {stats.input && (
        <div className="sec">
          <h4>Input</h4>
          <div className="row">
            <span>Keys:</span>
            <span>
              {stats.input.thrust ? 'T' : '-'}
              {stats.input.left ? 'L' : '-'}
              {stats.input.right ? 'R' : '-'}
              {stats.input.fire ? 'F' : '-'}
            </span>
          </div>
          <div className="row">
            <span>Mouse:</span>
            <span>x:{stats.input.mouseX} y:{stats.input.mouseY}</span>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="sec">
        <h4>Logs ({logs.length})</h4>
        <div className="logs">
          {logs.map((entry, i) => {
            const time = new Date(entry.t).toLocaleTimeString()
            const levelClass = entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : ''
            return (
              <div key={i} className={levelClass}>
                [{time}] {entry.level.toUpperCase()}: {entry.msg}
              </div>
            )
          })}
        </div>
        <div className="btns">
          <button onClick={handleClearLogs}>Clear Logs</button>
          <button onClick={handleCopyLogs}>Copy Logs</button>
        </div>
      </div>
    </div>
  )
}