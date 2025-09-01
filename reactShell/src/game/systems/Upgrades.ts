// Upgrades.ts - Upgrade system with tier-based selection and mod effects

import { GameState } from '../GameState'

// Complete mods interface matching the requirements
export interface Mods {
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

// Default mods (identity values)
export const defaultMods: Mods = {
  fireRateMul: 1.0,
  engineMul: 1.0,
  spread: 0,
  pierce: 0,
  ricochet: 0,
  shieldCharges: 3,
  bulletBounce: 0,
  bulletLifeMul: 1.0,
  bulletSpeedMul: 1.0,
  magnetRadius: 0,
  drone: false
}

// Upgrade definition
export type UpgradeTier = 'common' | 'rare' | 'epic' | 'legendary'

export interface Upgrade {
  id: string
  name: string
  tier: UpgradeTier
  apply: (mods: Mods) => void
  describe: (mods: Mods) => string
  stackable?: boolean // If false, can only be taken once
}

// Tier weights for selection (higher = more likely)
const TIER_WEIGHTS = {
  common: 60,
  rare: 30,
  epic: 8,
  legendary: 2
}

// 16 baseline upgrades matching vanilla behavior
export const UPGRADES: Upgrade[] = [
  // Common tier (basic improvements)
  {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    tier: 'common',
    apply: (mods) => { mods.fireRateMul *= 1.30 },
    describe: (mods) => `+30% fire rate (current: ${(mods.fireRateMul * 100).toFixed(0)}%)`
  },
  {
    id: 'engine_boost',
    name: 'Engine Boost',
    tier: 'common', 
    apply: (mods) => { mods.engineMul *= 1.20 },
    describe: (mods) => `+20% thrust (current: ${(mods.engineMul * 100).toFixed(0)}%)`
  },
  {
    id: 'shield_charge',
    name: 'Shield Charge',
    tier: 'common',
    apply: (mods) => { mods.shieldCharges += 1 },
    describe: (mods) => `+1 shield charge (total: ${mods.shieldCharges + 1})`
  },
  {
    id: 'bullet_speed',
    name: 'Velocity Boost',
    tier: 'common',
    apply: (mods) => { mods.bulletSpeedMul *= 1.25 },
    describe: (mods) => `+25% bullet speed (current: ${(mods.bulletSpeedMul * 100).toFixed(0)}%)`
  },
  {
    id: 'bullet_range',
    name: 'Extended Range',
    tier: 'common',
    apply: (mods) => { mods.bulletLifeMul *= 1.40 },
    describe: (mods) => `+40% bullet range (current: ${(mods.bulletLifeMul * 100).toFixed(0)}%)`
  },

  // Rare tier (tactical upgrades)
  {
    id: 'spread_shot',
    name: 'Spread Shot',
    tier: 'rare',
    apply: (mods) => { mods.spread += 2 },
    describe: (mods) => `+2 side bullets (total: ${mods.spread + 2} extra)`
  },
  {
    id: 'piercing',
    name: 'Piercing Rounds',
    tier: 'rare',
    apply: (mods) => { mods.pierce += 1 },
    describe: (mods) => `Bullets pierce +1 target (total: ${mods.pierce + 1})`
  },
  {
    id: 'ricochet',
    name: 'Ricochet',
    tier: 'rare',
    apply: (mods) => { mods.ricochet += 1 },
    describe: (mods) => `Bullets ricochet +1 time (total: ${mods.ricochet + 1})`
  },
  {
    id: 'bullet_bounce',
    name: 'Bouncing Bullets',
    tier: 'rare',
    apply: (mods) => { mods.bulletBounce += 1 },
    describe: (mods) => `Bullets bounce off edges +1 time (total: ${mods.bulletBounce + 1})`
  },
  {
    id: 'magnet_field',
    name: 'Magnetic Field',
    tier: 'rare',
    apply: (mods) => { mods.magnetRadius += 50 },
    describe: (mods) => `+50 salvage pickup radius (total: ${mods.magnetRadius + 50})`
  },

  // Epic tier (powerful combinations)
  {
    id: 'multi_fire',
    name: 'Multi-Fire',
    tier: 'epic',
    apply: (mods) => { 
      mods.fireRateMul *= 1.50
      mods.spread += 1 
    },
    describe: (mods) => `+50% fire rate + 1 spread bullet`
  },
  {
    id: 'hyper_engine',
    name: 'Hyper Engine',
    tier: 'epic',
    apply: (mods) => { 
      mods.engineMul *= 1.60
      mods.bulletSpeedMul *= 1.20
    },
    describe: (mods) => `+60% thrust + 20% bullet speed`
  },
  {
    id: 'armor_plating',
    name: 'Armor Plating', 
    tier: 'epic',
    apply: (mods) => { mods.shieldCharges += 2 },
    describe: (mods) => `+2 shield charges (total: ${mods.shieldCharges + 2})`
  },
  {
    id: 'plasma_rounds',
    name: 'Plasma Rounds',
    tier: 'epic',
    apply: (mods) => {
      mods.pierce += 2
      mods.bulletSpeedMul *= 1.30
    },
    describe: (mods) => `Pierce +2 targets + 30% bullet speed`
  },

  // Legendary tier (game-changing)
  {
    id: 'combat_drone',
    name: 'Combat Drone',
    tier: 'legendary',
    stackable: false,
    apply: (mods) => { mods.drone = true },
    describe: (mods) => `Deploy autonomous combat drone`
  },
  {
    id: 'omni_burst',
    name: 'Omni Burst',
    tier: 'legendary',
    apply: (mods) => {
      mods.fireRateMul *= 2.0
      mods.spread += 4
      mods.pierce += 1
    },
    describe: (mods) => `Double fire rate + 4 spread + 1 pierce`
  }
]

// Get weighted random upgrade choices for wave
export function getUpgradeChoices(wave: number, taken: Set<string>): Upgrade[] {
  // Filter out non-stackable upgrades that were already taken
  const availableUpgrades = UPGRADES.filter(upgrade => {
    if (upgrade.stackable === false && taken.has(upgrade.id)) {
      return false
    }
    return true
  })

  if (availableUpgrades.length === 0) {
    // Fallback if all non-stackable upgrades taken - return stackable ones
    return UPGRADES.filter(u => u.stackable !== false).slice(0, 3)
  }

  // Calculate tier probabilities based on wave (higher waves = better tiers)
  const baseWeights = { ...TIER_WEIGHTS }
  
  // Boost rare/epic/legendary chances on higher waves
  if (wave >= 5) {
    baseWeights.rare *= 1.5
    baseWeights.epic *= 2.0
    baseWeights.legendary *= 1.5
  }
  if (wave >= 10) {
    baseWeights.epic *= 2.0
    baseWeights.legendary *= 2.0
  }
  if (wave >= 15) {
    baseWeights.legendary *= 3.0
  }

  // Build weighted pool
  const weightedPool: Upgrade[] = []
  for (const upgrade of availableUpgrades) {
    const weight = baseWeights[upgrade.tier]
    for (let i = 0; i < weight; i++) {
      weightedPool.push(upgrade)
    }
  }

  // Select 3 unique upgrades
  const choices: Upgrade[] = []
  const selectedIds = new Set<string>()
  
  for (let attempts = 0; attempts < 100 && choices.length < 3; attempts++) {
    const randomUpgrade = weightedPool[Math.floor(Math.random() * weightedPool.length)]
    if (!selectedIds.has(randomUpgrade.id)) {
      choices.push(randomUpgrade)
      selectedIds.add(randomUpgrade.id)
    }
  }

  // Fallback: if we couldn't get 3 unique, fill with first available
  while (choices.length < 3 && choices.length < availableUpgrades.length) {
    for (const upgrade of availableUpgrades) {
      if (!selectedIds.has(upgrade.id)) {
        choices.push(upgrade)
        selectedIds.add(upgrade.id)
        break
      }
    }
  }

  return choices
}

// Apply upgrade to game state
export function applyUpgrade(upgrade: Upgrade, gameState: GameState): void {
  // Get current mods and apply upgrade
  const currentMods = gameState.getMods()
  upgrade.apply(currentMods)
  
  // Update mods in game state
  gameState.setMods(currentMods)
  
  // Track taken upgrade (for non-stackable upgrades)
  if (upgrade.stackable === false) {
    gameState.addTakenUpgrade(upgrade.id)
  }
  
  // Add to upgrade history
  gameState.addToUpgradeHistory({
    name: upgrade.name,
    tier: upgrade.tier
  })
}