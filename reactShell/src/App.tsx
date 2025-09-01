import { useEffect, useState } from 'react'
import GameCanvas, { HudData } from './game/GameCanvas'
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
  const [hudData, setHudData] = useState<HudData>({
    score: 0,
    wave: 1,
    combo: { value: 1.0, timer: 0, max: 2.3 },
    currency: { salvage: 0, gold: 0, platinum: 0, adamantium: 0 },
    upgrades: [],
    gamePhase: 'playing'
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
      <GameCanvas onStats={setStats} onHudData={setHudData} />
      <Hud 
        score={hudData.score}
        wave={hudData.wave}
        combo={hudData.combo}
        currency={hudData.currency}
        upgrades={hudData.upgrades}
        visible={hudData.gamePhase === 'playing' || hudData.gamePhase === 'wave-complete'}
      />
      <UpgradeMenu />
      <StatusOverlay />
      <PauseOverlay />
      <StartScreen visible={showStart} onDismiss={() => setShowStart(false)} />
      <DevPanel visible={showDev} stats={stats} />
    </div>
  )
}

export default App