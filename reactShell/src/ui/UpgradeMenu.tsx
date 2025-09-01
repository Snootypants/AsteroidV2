// UpgradeMenu.tsx - Between-wave upgrade picker with 3-choice UI
import { useEffect, useCallback } from 'react'
import { Upgrade } from '../game/systems/Upgrades'

interface UpgradeMenuProps {
  choices: Upgrade[]
  currentMods: any // Mods interface from Upgrades.ts
  onSelect: (upgrade: Upgrade) => void
}

export default function UpgradeMenu({ choices, currentMods, onSelect }: UpgradeMenuProps) {
  // Handle keyboard selection (1, 2, 3)
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key
    if (key === '1' && choices[0]) {
      onSelect(choices[0])
    } else if (key === '2' && choices[1]) {
      onSelect(choices[1])
    } else if (key === '3' && choices[2]) {
      onSelect(choices[2])
    }
  }, [choices, onSelect])

  // Set up keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  if (!choices || choices.length === 0) {
    return null
  }

  return (
    <div className="upgrade-overlay">
      <div className="upgrade-grid">
        {choices.map((upgrade, index) => (
          <div
            key={upgrade.id}
            className={`upgrade-card tier-${upgrade.tier}`}
            onClick={() => onSelect(upgrade)}
          >
            <div className="upgrade-name">{upgrade.name}</div>
            <div className={`tier-badge tier-${upgrade.tier}`}>
              {upgrade.tier.toUpperCase()}
            </div>
            <div className="upgrade-desc">
              {upgrade.describe(currentMods)}
            </div>
            <div className="upgrade-hotkey">
              Press {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}