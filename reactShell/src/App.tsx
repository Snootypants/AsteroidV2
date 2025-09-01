import { useEffect, useState } from 'react'
import GameCanvas from './game/GameCanvas'
import Hud from './ui/Hud'
import UpgradeMenu from './ui/UpgradeMenu'
import StatusOverlay from './ui/StatusOverlay'
import PauseOverlay from './ui/PauseOverlay'
import StartScreen from './ui/StartScreen'
import { DevPanel, DevStats } from './ui/DevPanel'

function App() {
  const [showStart, setShowStart] = useState(true)
  const [showDev, setShowDev] = useState(false)
  const [stats, setStats] = useState<DevStats>({
    fps: 0,
    entities: { ships: 0, asteroids: 0, bullets: 0, other: 0 }
  })

  useEffect(() => {
    // Initialize game
    console.log('Asteroids React Shell initializing...')
    
    // Backtick key listener for dev panel toggle
    const onKey = (e: KeyboardEvent) => { 
      if (e.code === 'Backquote') setShowDev(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app">
      <GameCanvas onStats={setStats} />
      <Hud />
      <UpgradeMenu />
      <StatusOverlay />
      <PauseOverlay />
      <StartScreen visible={showStart} onDismiss={() => setShowStart(false)} />
      <DevPanel visible={showDev} stats={stats} />
    </div>
  )
}

export default App