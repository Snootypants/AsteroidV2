import { useEffect } from 'react'

interface StartScreenProps {
  visible: boolean
  onDismiss: () => void
}

export default function StartScreen({ visible, onDismiss }: StartScreenProps) {
  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        onDismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <div className="overlay" onClick={onDismiss}>
      <img src="assets/start_screen.png" alt="Start Screen" />
    </div>
  )
}