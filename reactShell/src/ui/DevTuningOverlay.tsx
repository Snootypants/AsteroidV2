import React from 'react'

interface DevTuningOverlayProps {
  visible: boolean
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
}

export default function DevTuningOverlay({
  visible,
  value,
  min = 40,
  max = 140,
  step = 1,
  onChange
}: DevTuningOverlayProps) {
  if (!visible) return null

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <div className="dev-overlay">
      <label>
        Ship size: {value} px
        <br />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleNumberChange}
        />
      </label>
    </div>
  )
}