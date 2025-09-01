// GameState.ts - Central state management
export class GameState {
  private score: number = 0
  private lives: number = 3
  private level: number = 1
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
    this.gameOver = false
    this.paused = false
  }

  // Get full state snapshot for debugging
  getState() {
    return {
      score: this.score,
      lives: this.lives,
      level: this.level,
      gameOver: this.gameOver,
      paused: this.paused
    }
  }
}