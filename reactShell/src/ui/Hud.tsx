// Hud.tsx - Score, wave, combo display

type HudProps = {
  score: number
  wave: number
  combo: { value: number; timer: number; max: number }
  currency: { salvage: number; gold: number; platinum: number; adamantium: number }
  upgrades: Array<{ name: string; tier?: string }>
  visible?: boolean // default true
}

export default function Hud({ 
  score, 
  wave, 
  combo, 
  currency, 
  upgrades, 
  visible = true 
}: HudProps) {
  if (!visible) return null

  // Calculate combo bar width percentage
  const comboBarWidth = Math.min((combo.timer / combo.max) * 100, 100)
  const showCombo = combo.timer > 0 && combo.value > 1.0

  return (
    <div className="hud">
      {/* Top-left: Wave and Score */}
      <div className="hud-tl">
        <div>Wave {wave}</div>
        <div>{score.toLocaleString()}</div>
      </div>

      {/* Top-right: Currency panel */}
      <div className="hud-tr">
        <div className="hud-panel">
          <div className="hud-row">
            <div className="hud-chip">{currency.salvage}</div>
            <div className="hud-chip">{currency.gold}</div>
            <div className="hud-chip">{currency.platinum}</div>
            <div className="hud-chip">{currency.adamantium}</div>
          </div>
        </div>
      </div>

      {/* Top-center: Combo meter */}
      {showCombo && (
        <div className="hud-tc">
          <div>x{combo.value.toFixed(2)}</div>
          <div className="combo-wrap">
            <div 
              className="combo-bar" 
              style={{ width: `${comboBarWidth}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom-left: Upgrades */}
      <div className="hud-bl">
        <div>Upgrades</div>
        <ul className="hud-upgrades">
          {upgrades.map((upgrade, i) => (
            <li key={i}>
              {upgrade.name}{upgrade.tier ? ` (${upgrade.tier})` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}