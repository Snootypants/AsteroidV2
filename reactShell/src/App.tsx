import { useEffect, useState, useRef } from 'react'
import GameCanvas, { HudData, MiniSnapshot } from './game/GameCanvas'
import Hud from './ui/Hud'
import UpgradeMenu from './ui/UpgradeMenu'
import StatusOverlay from './ui/StatusOverlay'
import PauseOverlay from './ui/PauseOverlay'
import StartScreen from './ui/StartScreen'
import Minimap from './ui/Minimap'
import { DevPanel, DevStats } from './ui/DevPanel'
import { Upgrade, getUpgradeChoices, applyUpgrade } from './game/systems/Upgrades'
import { GameState } from './game/GameState'

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
  const [miniSnapshot, setMiniSnapshot] = useState<MiniSnapshot | null>(null)
  const [upgradeChoices, setUpgradeChoices] = useState<Upgrade[]>([])
  const [resumeSignal, setResumeSignal] = useState<boolean>(false)
  const gameStateRef = useRef<GameState | null>(null)

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

  // Handle game state ready
  const handleGameStateReady = (gameState: GameState) => {
    gameStateRef.current = gameState
  }

  // Handle upgrade phase
  const handleUpgradePhase = (wave: number, takenUpgrades: Set<string>) => {
    if (gameStateRef.current) {
      const choices = getUpgradeChoices(wave, takenUpgrades)
      setUpgradeChoices(choices)
    }
  }

  // Handle upgrade selection
  const handleUpgradeSelect = (upgrade: Upgrade) => {
    if (gameStateRef.current) {
      applyUpgrade(upgrade, gameStateRef.current)
      setUpgradeChoices([])
      // Signal GameCanvas to resume
      setResumeSignal(prev => !prev) // Toggle to trigger useEffect
    }
  }

  return (
    <div className="app">
      <GameCanvas 
        onStats={setStats} 
        onHudData={setHudData} 
        onMiniSnapshot={setMiniSnapshot}
        onGameStateReady={handleGameStateReady}
        onUpgradePhase={handleUpgradePhase}
        resumeGame={resumeSignal}
      />
      <Hud 
        score={hudData.score}
        wave={hudData.wave}
        combo={hudData.combo}
        currency={hudData.currency}
        upgrades={hudData.upgrades}
        visible={hudData.gamePhase === 'playing' || hudData.gamePhase === 'wave-complete'}
      />
      <Minimap 
        data={miniSnapshot}
        visible={hudData.gamePhase === 'playing' || hudData.gamePhase === 'wave-complete'}
      />
      {hudData.gamePhase === 'upgrade' && upgradeChoices.length > 0 && (
        <UpgradeMenu 
          choices={upgradeChoices}
          currentMods={gameStateRef.current?.getMods() || {}}
          onSelect={handleUpgradeSelect}
        />
      )}
      <StatusOverlay />
      <PauseOverlay />
      <StartScreen visible={showStart} onDismiss={() => setShowStart(false)} />
      <DevPanel visible={showDev} stats={stats} />
    </div>
  )
}

export default App