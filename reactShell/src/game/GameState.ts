// GameState.ts - Central state management

// Game phase types for wave progression
export type GamePhase = 'playing' | 'wave-complete' | 'upgrade'

// Currency tracking
interface Currency {
  salvage: number
  gold: number
  platinum: number
  adamantium: number
}

// Upgrade tracking for history display
interface UpgradeHistoryItem {
  name: string
  tier?: string
}

// Mods system for tracking upgrades
interface Mods {
  fireRateMul: number
  engineMul: number
  spread: number
  pierce: number
  ricochet: number
  shieldCharges: number
  bulletBounce: number
  bulletLifeMul: number
  bulletSpeedMul: number
  magnetRadius: number
  drone: boolean
}

export class GameState {
  private score: number = 0
  private lives: number = 3
  private level: number = 1
  private wave: number = 1
  private gamePhase: GamePhase = 'playing'
  private gameOver: boolean = false
  private paused: boolean = false
  private combo: number = 1.0
  private comboTimer: number = 0
  private currency: Currency = {
    salvage: 0,
    gold: 0,
    platinum: 0,
    adamantium: 0
  }
  private upgradeHistory: UpgradeHistoryItem[] = []
  private takenUpgrades: Set<string> = new Set() // Track taken upgrades for selection logic
  private mods: Mods = {
    fireRateMul: 1.0,
    engineMul: 1.0,
    spread: 0,
    pierce: 0,
    ricochet: 0,
    shieldCharges: 0,  // Start with no shields (acquired through upgrades)
    bulletBounce: 0,
    bulletLifeMul: 1.0,
    bulletSpeedMul: 1.0,
    magnetRadius: 0,
    drone: false
  }

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
    this.combo = 1.0
    this.comboTimer = 0
    this.currency = {
      salvage: 0,
      gold: 0,
      platinum: 0,
      adamantium: 0
    }
    this.upgradeHistory = []
    this.takenUpgrades = new Set()
    this.mods = {
      fireRateMul: 1.0,
      engineMul: 1.0,
      spread: 0,
      pierce: 0,
      ricochet: 0,
      shieldCharges: 0,  // Start with no shields (acquired through upgrades)
      bulletBounce: 0,
      bulletLifeMul: 1.0,
      bulletSpeedMul: 1.0,
      magnetRadius: 0,
      drone: false
    }
  }

  // Shield charge management
  getShieldCharges(): number {
    return this.mods.shieldCharges
  }

  setShieldCharges(charges: number): void {
    this.mods.shieldCharges = Math.max(0, charges)
  }

  addShieldCharges(charges: number): void {
    this.mods.shieldCharges += charges
  }

  consumeShieldCharge(): boolean {
    if (this.mods.shieldCharges > 0) {
      this.mods.shieldCharges--
      return true
    }
    return false
  }

  hasShields(): boolean {
    return this.mods.shieldCharges > 0
  }

  // Mods management
  getMods(): Mods {
    return this.mods
  }

  setMods(mods: Mods): void {
    this.mods = mods
  }

  // Upgrade history management
  addToUpgradeHistory(item: UpgradeHistoryItem): void {
    this.upgradeHistory.push(item)
  }

  // Taken upgrades tracking
  getTakenUpgrades(): Set<string> {
    return this.takenUpgrades
  }

  addTakenUpgrade(upgradeId: string): void {
    this.takenUpgrades.add(upgradeId)
  }

  // Currency management
  getCurrency() {
    return this.currency
  }

  addCurrency(type: 'salvage' | 'gold' | 'platinum' | 'adamantium', amount: number): void {
    this.currency[type] += amount
  }

  spendCurrency(type: 'salvage' | 'gold' | 'platinum' | 'adamantium', amount: number): boolean {
    if (this.currency[type] >= amount) {
      this.currency[type] -= amount
      return true
    }
    return false
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
      paused: this.paused,
      combo: this.combo,
      comboTimer: this.comboTimer,
      currency: this.currency,
      upgradeHistory: this.upgradeHistory,
      mods: this.mods
    }
  }
}

// HUD selectors (pure functions for read-only data access)
export const selectScore = (s: GameState) => s.getScore()
export const selectWave = (s: GameState) => s.getWave()
export const selectCombo = (s: GameState) => ({ value: s['combo'], timer: s['comboTimer'], max: 2.3 })
export const selectCurrency = (s: GameState) => s['currency']
export const selectUpgrades = (s: GameState) => s['upgradeHistory'].slice(-8)