// Input.ts - Keyboard/mouse handling

export interface InputState {
  thrust: boolean
  turnLeft: boolean
  turnRight: boolean
  fire: boolean
  mouseX: number
  mouseY: number
}

export class Input {
  private keys = new Set<string>()
  private mouseState = { x: 0, y: 0, leftButton: false, rightButton: false }

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase())
      if (e.key === ' ') e.preventDefault()
    })

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase())
    })

    // Mouse events
    window.addEventListener('mousemove', (e) => {
      this.mouseState.x = e.clientX
      this.mouseState.y = e.clientY
    })

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseState.leftButton = true
      if (e.button === 2) this.mouseState.rightButton = true
    })

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseState.leftButton = false
      if (e.button === 2) this.mouseState.rightButton = false
    })

    // Prevent context menu
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }

  update() {
    // Input updates happen via event listeners, nothing to do here
  }

  getState(): InputState {
    return {
      thrust: this.keys.has('w') || this.keys.has('arrowup') || this.mouseState.rightButton,
      turnLeft: this.keys.has('a') || this.keys.has('arrowleft'),
      turnRight: this.keys.has('d') || this.keys.has('arrowright'),
      fire: this.keys.has(' ') || this.mouseState.leftButton,
      mouseX: this.mouseState.x,
      mouseY: this.mouseState.y
    }
  }
}