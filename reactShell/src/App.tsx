import { useEffect, useState } from 'react'
import GameCanvas from './game/GameCanvas'
import Hud from './ui/Hud'
import UpgradeMenu from './ui/UpgradeMenu'
import StatusOverlay from './ui/StatusOverlay'
import PauseOverlay from './ui/PauseOverlay'
import StartScreen from './ui/StartScreen'

function App() {
  const [showStart, setShowStart] = useState(true)

  useEffect(() => {
    // Initialize game
    console.log('Asteroids React Shell initializing...')
  }, [])

  return (
    <div className="app">
      <GameCanvas />
      <Hud />
      <UpgradeMenu />
      <StatusOverlay />
      <PauseOverlay />
      <StartScreen visible={showStart} onDismiss={() => setShowStart(false)} />
    </div>
  )
}

export default App