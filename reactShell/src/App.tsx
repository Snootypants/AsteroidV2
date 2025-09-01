import { useEffect, useState } from 'react'
import GameCanvas from './game/GameCanvas'
import Hud from './ui/Hud'
import UpgradeMenu from './ui/UpgradeMenu'
import StatusOverlay from './ui/StatusOverlay'
import PauseOverlay from './ui/PauseOverlay'
import StartScreen from './ui/StartScreen'
import DevTuningOverlay from './ui/DevTuningOverlay'

function App() {
  const [showStart, setShowStart] = useState(true)
  const [shipPx, setShipPx] = useState<number>(65)
  const [showDev, setShowDev] = useState(false)

  useEffect(() => {
    // Initialize game
    console.log('Asteroids React Shell initializing...')
    
    // Backtick key listener for dev overlay toggle
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`') {
        setShowDev(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="app">
      <GameCanvas shipPixelSize={shipPx} />
      <Hud />
      <UpgradeMenu />
      <StatusOverlay />
      <PauseOverlay />
      <StartScreen visible={showStart} onDismiss={() => setShowStart(false)} />
      <DevTuningOverlay 
        visible={showDev} 
        value={shipPx} 
        onChange={setShipPx} 
      />
    </div>
  )
}

export default App