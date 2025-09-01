// GameState.ts - Central state management

// Game phase types for wave progression
export type GamePhase = 'playing' | 'wave-complete' | 'upgrade'

export class GameState {
  private score: number = 0
  private lives: number = 3
  private level: number = 1
  private wave: number = 1
  private gamePhase: GamePhase = 'playing'
  private gameOver: boolean = false
  private paused: boolean = false

  constructor() {
    this.resetGame()
  }

  // Score management
  addScore(points: number): void {
    this.score += points
  }

  getScore(): number {
    return this.score
  }

  setScore(score: number): void {
    this.score = score
  }

  // Lives management
  getLives(): number {
    return this.lives
  }

  loseLife(): void {
    if (this.lives > 0) {
      this.lives--
    }
    if (this.lives <= 0) {
      this.gameOver = true
    }
  }

  addLife(): void {
    this.lives++
  }

  // Level management
  getLevel(): number {
    return this.level
  }

  nextLevel(): void {
    this.level++
  }

  // Wave management
  getWave(): number {
    return this.wave
  }

  nextWave(): void {
    this.wave++
    this.gamePhase = 'playing'
  }

  resetWave(): void {
    // Reset to wave 1 (used for game restart)
    this.wave = 1
    this.gamePhase = 'playing'
  }

  // Game phase management
  getGamePhase(): GamePhase {
    return this.gamePhase
  }

  setGamePhase(phase: GamePhase): void {
    this.gamePhase = phase
  }

  // Wave completion detection
  completeWave(): void {
    this.gamePhase = 'wave-complete'
  }

  // Game state management
  isGameOver(): boolean {
    return this.gameOver
  }

  isPaused(): boolean {
    return this.paused
  }

  pause(): void {
    this.paused = true
  }

  resume(): void {
    this.paused = false
  }

  resetGame(): void {
    this.score = 0
    this.lives = 3
    this.level = 1
    this.wave = 1
    this.gamePhase = 'playing'
    this.gameOver = false
    this.paused = false
  }

  // Get full state snapshot for debugging
  getState() {
    return {
      score: this.score,
      lives: this.lives,
      level: this.level,
      wave: this.wave,
      gamePhase: this.gamePhase,
      gameOver: this.gameOver,
      paused: this.paused
    }
  }
}