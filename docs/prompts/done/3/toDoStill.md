# Asteroids V2 - Remaining Tasks

## Phase 1: Core Combat (Blocks 1-4)

### Block 1: Bullets system 
- [ ] spawn, velocity, TTL, wrapping
- [ ] Files: game/entities/Bullet.ts, game/systems/BulletManager.ts, Ship.ts (update)

### Block 2: Basic asteroids 
- [ ] 3 sizes, spawning, movement
- [ ] Files: game/entities/Asteroid.ts, game/systems/Spawning.ts (partial)

### Block 3: Collision system 
- [ ] bullet↔asteroid, ship↔asteroid
- [ ] Files: game/systems/Collision.ts, integrate with entities

### Block 4: Wave spawning & progression logic
- [ ] Files: game/systems/Spawning.ts (complete), GameState.ts (update)

## Phase 2: Advanced Combat (Blocks 5-7)

### Block 5: Enemy hunters 
- [ ] AI, movement, shooting
- [ ] Files: game/entities/EnemyHunter.ts, Spawning.ts (update)

### Block 6: Particles & debris systems
- [ ] Files: game/entities/Particles.ts, game/entities/Debris.ts

### Block 7: Shield & invulnerability mechanics
- [ ] Files: Ship.ts (update), GameState.ts (update), Collision.ts (update)

## Phase 3: Game Systems (Blocks 8-11)

### Block 8: HUD 
- [ ] score, wave, combo, currency display
- [ ] Files: ui/Hud.tsx, GameState.ts (selectors)

### Block 9: Minimap tactical display
- [ ] Files: ui/Minimap.tsx

### Block 10: Upgrade system & picker UI
- [ ] Files: game/systems/Upgrades.ts, ui/UpgradeMenu.tsx

### Block 11: Currency pickups & magnetism
- [ ] Files: game/entities/Pickup.ts, Spawning.ts (update)

## Phase 4: Meta Systems (Blocks 12-15)

### Block 12: Hangar shop every 3 waves
- [ ] Files: ui/HangarShop.tsx, GameState.ts (update)

### Block 13: Audio system with Web Audio API
- [ ] Files: game/Audio.ts

### Block 14: Pause, restart, game over screens
- [ ] Files: ui/GameOverScreen.tsx, PauseOverlay.tsx (update), GameLoop.ts (update)

### Block 15: Final parity audit & polish
- [ ] Files: All game files requiring constant tweaks

## Current Status
- **Complete**: ~10% (foundational systems only)
- **Remaining**: 15 execution blocks across 4 phases
- **Next Priority**: Block 1 (Bullets system)