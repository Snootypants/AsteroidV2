cc:
╭────────────────────────────────────────────────────────────────────╮
│ Ready to code?                                                     │
│                                                                    │
│ Here is Claude's plan:                                             │
│ ╭────────────────────────────────────────────────────────────────╮ │
│ │ ASTEROIDS V2 - FULL BUILD PLAN FOR REACT/THREE.JS PARITY       │ │
│ │                                                                │ │
│ │ 1. ROADMAP - Incremental Phases to Parity                      │ │
│ │                                                                │ │
│ │ Phase 1: Core Combat (Blocks 1-4)                              │ │
│ │                                                                │ │
│ │ - Block 1: Bullets system - spawn, velocity, TTL, wrapping     │ │
│ │ - Block 2: Basic asteroids - 3 sizes, spawning, movement       │ │
│ │ - Block 3: Collision system - bullet↔asteroid, ship↔asteroid   │ │
│ │ - Block 4: Wave spawning & progression logic                   │ │
│ │                                                                │ │
│ │ Phase 2: Advanced Combat (Blocks 5-7)                          │ │
│ │                                                                │ │
│ │ - Block 5: Enemy hunters - AI, movement, shooting              │ │
│ │ - Block 6: Particles & debris systems                          │ │
│ │ - Block 7: Shield & invulnerability mechanics                  │ │
│ │                                                                │ │
│ │ Phase 3: Game Systems (Blocks 8-11)                            │ │
│ │                                                                │ │
│ │ - Block 8: HUD - score, wave, combo, currency display          │ │
│ │ - Block 9: Minimap tactical display                            │ │
│ │ - Block 10: Upgrade system & picker UI                         │ │
│ │ - Block 11: Currency pickups & magnetism                       │ │
│ │                                                                │ │
│ │ Phase 4: Meta Systems (Blocks 12-15)                           │ │
│ │                                                                │ │
│ │ - Block 12: Hangar shop every 3 waves                          │ │
│ │ - Block 13: Audio system with Web Audio API                    │ │
│ │ - Block 14: Pause, restart, game over screens                  │ │
│ │ - Block 15: Final parity audit & polish                        │ │
│ │                                                                │ │
│ │ 2. FEATURE CHECKLIST WITH ACCEPTANCE CRITERIA                  │ │
│ │                                                                │ │
│ │ ✅ Already Implemented                                          │ │
│ │                                                                │ │
│ │ - Ship movement (WASD/arrows, mouse aim)                       │ │
│ │ - World wrapping                                               │ │
│ │ - Start screen overlay                                         │ │
│ │ - Basic rendering pipeline                                     │ │
│ │ - Input system                                                 │ │
│ │                                                                │ │
│ │ 📋 To Implement                                                │ │
│ │                                                                │ │
│ │ Bullets                                                        │ │
│ │ - Fire rate: 0.16s cooldown                                    │ │
│ │ - Speed: 70 units/s                                            │ │
│ │ - TTL: 1.1 seconds                                             │ │
│ │ - Velocity inheritance from ship                               │ │
│ │ - Muzzle offset (ship nose)                                    │ │
│ │ - World wrapping                                               │ │
│ │                                                                │ │
│ │ Asteroids                                                      │ │
│ │ - Large (r=6, HP=1, score=20), Medium (r=3.5, HP=1, score=50), │ │
│ │  Small (r=2, HP=1, score=100)                                  │ │
│ │ - Split: Large→2 Medium, Medium→2 Small                        │ │
│ │ - Base speed: 8 units/s + random                               │ │
│ │ - Ore types: iron (90%), gold (7%), platinum (2.5%),           │ │
│ │ adamantium (0.5%)                                              │ │
│ │ - Currency drops on destruction                                │ │
│ │                                                                │ │
│ │ Collisions                                                     │ │
│ │ - Circle-circle detection                                      │ │
│ │ - Bullet↔asteroid (bullet destroyed, asteroid damaged)         │ │
│ │ - Ship↔asteroid (damage if not invuln)                         │ │
│ │ - Hunter↔ship bullets                                          │ │
│ │                                                                │ │
│ │ Wave System                                                    │ │
│ │ - Asteroid count: (3 + wave) × 2                               │ │
│ │ - Boss spawn: wave ≥3, count = min(1 + floor((wave-2)/2), 4)   │ │
│ │ - Wave clear → upgrade screen                                  │ │
│ │ - Every 3rd wave → hangar shop                                 │ │
│ │                                                                │ │
│ │ Enemy Hunters                                                  │ │
│ │ - Radius: 1.2, speed: 26, fire rate: 0.9s                      │ │
│ │ - Strafing AI (preferred distance: 14 units)                   │ │
│ │ - Boss sprites (boss1-10.png, randomized)                      │ │
│ │ - Speed scaling: ×1.2 per boss level                           │ │
│ │                                                                │ │
│ │ Particles & Debris                                             │ │
│ │ - 220 pooled tetrahedron debris                                │ │
│ │ - Burst particles for hits/explosions                          │ │
│ │ - Configurable speed, life, color                              │ │
│ │                                                                │ │
│ │ HUD                                                            │ │
│ │ - Wave counter (top-left)                                      │ │
│ │ - Currency display (top-right, glass effect)                   │ │
│ │ - Combo multiplier & timer (2.3s)                              │ │
│ │ - Upgrade history (bottom-left, max 8)                         │ │
│ │                                                                │ │
│ │ Minimap                                                        │ │
│ │ - 280×187 canvas                                               │ │
│ │ - Show all entities as dots                                    │ │
│ │ - Player centered view                                         │ │
│ │                                                                │ │
│ │ Upgrades                                                       │ │
│ │ - 16 base upgrades with rarity tiers                           │ │
│ │ - 3-choice picker with keyboard (1/2/3)                        │ │
│ │ - Mods object tracking all bonuses                             │ │
│ │                                                                │ │
│ │ Currency System                                                │ │
│ │ - Salvage (all asteroids)                                      │ │
│ │ - Gold (27% from gold ore)                                     │ │
│ │ - Platinum (60% from plat ore)                                 │ │
│ │ - Adamantium (40% from adam ore)                               │ │
│ │ - Magnetic collection radius                                   │ │
│ │                                                                │ │
│ │ Hangar Shop                                                    │ │
│ │ - 6 purchasable items                                          │ │
│ │ - Currency costs (salvage + rare)                              │ │
│ │ - Every 3 waves                                                │ │
│ │                                                                │ │
│ │ Audio                                                          │ │
│ │ - 9 sound effects (Web Audio API)                              │ │
│ │ - Specific frequencies & waveforms                             │ │
│ │ - Volume settings in pause menu                                │ │
│ │                                                                │ │
│ │ Meta Features                                                  │ │
│ │ - Pause (ESC)                                                  │ │
│ │ - Restart (R)                                                  │ │
│ │ - Debug console (F1/backtick)                                  │ │
│ │ - Invuln: 2s respawn, 3s wave start, 1s hit                    │ │
│ │                                                                │ │
│ │ 3. CONSTANTS MAP                                               │ │
│ │                                                                │ │
│ │ | Constant               | Value | Vanilla Line | Target       │ │
│ │ Location |                                                     │ │
│ │ |------------------------|-------|--------------|------------- │ │
│ │ ----|                                                          │ │
│ │ | World                  |       |              |              │ │
│ │     |                                                          │ │
│ │ | WORLD.width            | 750   | 15           | GameState.ts │ │
│ │     |                                                          │ │
│ │ | WORLD.height           | 498   | 16           | GameState.ts │ │
│ │     |                                                          │ │
│ │ | VISIBLE_HEIGHT         | 99.6  | 18           | Scene.ts     │ │
│ │     |                                                          │ │
│ │ | halfWorld.x            | 125   | calc         | Physics.ts   │ │
│ │     |                                                          │ │
│ │ | halfWorld.y            | 83    | calc         | Physics.ts   │ │
│ │     |                                                          │ │
│ │ | Ship                   |       |              |              │ │
│ │     |                                                          │ │
│ │ | PLAYER.accel           | 40    | 21           | Ship.ts      │ │
│ │     |                                                          │ │
│ │ | PLAYER.maxSpeed        | 40    | 22           | Ship.ts      │ │
│ │     |                                                          │ │
│ │ | PLAYER.friction        | 0.98  | 23           | Ship.ts      │ │
│ │     |                                                          │ │
│ │ | PLAYER.turn            | 3.2   | 24           | Ship.ts      │ │
│ │     |                                                          │ │
│ │ | PLAYER.fireRate        | 0.16  | 25           | Ship.ts      │ │
│ │     |                                                          │ │
│ │ | SHIP_RADIUS            | 1.5   | ~950         | Ship.ts      │ │
│ │     |                                                          │ │
│ │ | Bullets                |       |              |              │ │
│ │     |                                                          │ │
│ │ | BULLET.speed           | 70    | 35           | Bullet.ts    │ │
│ │     |                                                          │ │
│ │ | BULLET.life            | 1.1   | 35           | Bullet.ts    │ │
│ │     |                                                          │ │
│ │ | BULLET.radius          | 0.2   | 35           | Bullet.ts    │ │
│ │     |                                                          │ │
│ │ | Asteroids              |       |              |              │ │
│ │     |                                                          │ │
│ │ | ASTEROIDS.large.r      | 6     | 29           | Asteroid.ts  │ │
│ │     |                                                          │ │
│ │ | ASTEROIDS.large.score  | 20    | 29           | Asteroid.ts  │ │
│ │     |                                                          │ │
│ │ | ASTEROIDS.medium.r     | 3.5   | 30           | Asteroid.ts  │ │
│ │     |                                                          │ │
│ │ | ASTEROIDS.medium.score | 50    | 30           | Asteroid.ts  │ │
│ │     |                                                          │ │
│ │ | ASTEROIDS.small.r      | 2.0   | 31           | Asteroid.ts  │ │
│ │     |                                                          │ │
│ │ | ASTEROIDS.small.score  | 100   | 31           | Asteroid.ts  │ │
│ │     |                                                          │ │
│ │ | ASTEROIDS.baseSpeed    | 8     | 32           | Asteroid.ts  │ │
│ │     |                                                          │ │
│ │ | Enemies                |       |              |              │ │
│ │     |                                                          │ │
│ │ | ENEMY.radius           | 1.2   | 38           |              │ │
│ │ EnemyHunter.ts  |                                              │ │
│ │ | ENEMY.accel            | 20    | 39           |              │ │
│ │ EnemyHunter.ts  |                                              │ │
│ │ | ENEMY.maxSpeed         | 26    | 40           |              │ │
│ │ EnemyHunter.ts  |                                              │ │
│ │ | ENEMY.fireRate         | 0.9   | 41           |              │ │
│ │ EnemyHunter.ts  |                                              │ │
│ │ | ENEMY.bulletSpeed      | 55    | 42           |              │ │
│ │ EnemyHunter.ts  |                                              │ │
│ │ | ENEMY.bulletLife       | 1.6   | 43           |              │ │
│ │ EnemyHunter.ts  |                                              │ │
│ │ | ENEMY.score            | 150   | 44           |              │ │
│ │ EnemyHunter.ts  |                                              │ │
│ │ | ENEMY.preferredDist    | 14    | 45           |              │ │
│ │ EnemyHunter.ts  |                                              │ │
│ │ | Game                   |       |              |              │ │
│ │     |                                                          │ │
│ │ | COMBO_TIMER            | 2.3   | ~1365        | GameState.ts │ │
│ │     |                                                          │ │
│ │ | COMBO_DECAY            | 0.25  | ~1380        | GameState.ts │ │
│ │     |                                                          │ │
│ │ | INVULN_SPAWN           | 2.0   | 974          | GameState.ts │ │
│ │     |                                                          │ │
│ │ | INVULN_WAVE            | 3.0   | 1466         | GameState.ts │ │
│ │     |                                                          │ │
│ │ | INVULN_HIT             | 1.0   | ~1470        | GameState.ts │ │
│ │     |                                                          │ │
│ │                                                                │ │
│ │ 4. MODULE/FILE BREAKDOWN                                       │ │
│ │                                                                │ │
│ │ Core Game State                                                │ │
│ │                                                                │ │
│ │ game/GameState.ts                                              │ │
│ │ interface GameState {                                          │ │
│ │   wave: number                                                 │ │
│ │   score: number                                                │ │
│ │   combo: number                                                │ │
│ │   comboTimer: number                                           │ │
│ │   currency: { salvage: number, gold: number, platinum: number, │ │
│ │  adamantium: number }                                          │ │
│ │   mods: ModsObject                                             │ │
│ │   upgradeHistory: Upgrade[]                                    │ │
│ │   invulnTimer: number                                          │ │
│ │   gamePhase: 'start' | 'playing' | 'upgrade' | 'hangar' |      │ │
│ │ 'gameover'                                                     │ │
│ │   paused: boolean                                              │ │
│ │ }                                                              │ │
│ │                                                                │ │
│ │ Entity Classes                                                 │ │
│ │                                                                │ │
│ │ game/entities/Ship.ts (✅ Partial)                              │ │
│ │ - Add: fire(), takeDamage(), respawn()                         │ │
│ │                                                                │ │
│ │ game/entities/Bullet.ts                                        │ │
│ │ - Constructor(pos, vel, isEnemy)                               │ │
│ │ - update(dt): movement, TTL, wrapping                          │ │
│ │ - Properties: speed, life, radius                              │ │
│ │                                                                │ │
│ │ game/entities/Asteroid.ts                                      │ │
│ │ - Constructor(size, pos, vel, oreType)                         │ │
│ │ - split(): returns child asteroids                             │ │
│ │ - takeDamage(): handle hits, drops                             │ │
│ │ - Properties: size, hp, score, oreType                         │ │
│ │                                                                │ │
│ │ game/entities/EnemyHunter.ts                                   │ │
│ │ - Constructor(level, pos)                                      │ │
│ │ - update(dt, shipPos): AI movement                             │ │
│ │ - fire(): create enemy bullets                                 │ │
│ │ - Properties: speed scaling, sprite                            │ │
│ │                                                                │ │
│ │ game/entities/Particles.ts                                     │ │
│ │ - burst(pos, count, color, speed)                              │ │
│ │ - update(dt): fade, movement                                   │ │
│ │ - Object pooling                                               │ │
│ │                                                                │ │
│ │ game/entities/Debris.ts                                        │ │
│ │ - spawn(pos, vel, color)                                       │ │
│ │ - update(dt): physics, fade                                    │ │
│ │ - 220 pooled tetrahedrons                                      │ │
│ │                                                                │ │
│ │ System Managers                                                │ │
│ │                                                                │ │
│ │ game/systems/BulletManager.ts                                  │ │
│ │ - fire(ship, mods): handle spread, pierce                      │ │
│ │ - update(dt): all bullets                                      │ │
│ │ - Pool management                                              │ │
│ │                                                                │ │
│ │ game/systems/Collision.ts                                      │ │
│ │ - checkCollisions(): all entity pairs                          │ │
│ │ - circleCircle(a, b): detection                                │ │
│ │ - handleHit(): damage, effects                                 │ │
│ │                                                                │ │
│ │ game/systems/Spawning.ts                                       │ │
│ │ - spawnWave(waveNum): asteroids                                │ │
│ │ - spawnBosses(waveNum): hunters                                │ │
│ │ - spawnPickup(pos, type, amount)                               │ │
│ │                                                                │ │
│ │ game/systems/Upgrades.ts                                       │ │
│ │ - getUpgradeChoices(wave): 3 weighted                          │ │
│ │ - applyUpgrade(upgrade, mods)                                  │ │
│ │ - Rarity weighting system                                      │ │
│ │                                                                │ │
│ │ Rendering                                                      │ │
│ │                                                                │ │
│ │ game/render/Scene.ts (✅ Partial)                               │ │
│ │ - Add: starfield (16k stars)                                   │ │
│ │ - Add: warp effect system                                      │ │
│ │                                                                │ │
│ │ game/render/PostFX.ts (✅ Exists)                               │ │
│ │ - Verify: bloom, outline, vignette                             │ │
│ │                                                                │ │
│ │ game/render/Materials.ts (✅ Exists)                            │ │
│ │ - Add: asteroid materials by ore type                          │ │
│ │                                                                │ │
│ │ UI Components                                                  │ │
│ │                                                                │ │
│ │ ui/Hud.tsx                                                     │ │
│ │ - Wave, score, combo displays                                  │ │
│ │ - Currency with glass effect                                   │ │
│ │ - Upgrade history stack                                        │ │
│ │                                                                │ │
│ │ ui/Minimap.tsx                                                 │ │
│ │ - 280×187 canvas                                               │ │
│ │ - Entity dots, player center                                   │ │
│ │                                                                │ │
│ │ ui/UpgradeMenu.tsx                                             │ │
│ │ - 3 choice cards                                               │ │
│ │ - Keyboard shortcuts (1/2/3)                                   │ │
│ │                                                                │ │
│ │ ui/HangarShop.tsx                                              │ │
│ │ - 6 item grid                                                  │ │
│ │ - Currency costs                                               │ │
│ │ - Purchase handlers                                            │ │
│ │                                                                │ │
│ │ ui/PauseOverlay.tsx (✅ Exists)                                 │ │
│ │ - Add: sound settings                                          │ │
│ │ - Add: controls display                                        │ │
│ │                                                                │ │
│ │ ui/GameOverScreen.tsx                                          │ │
│ │ - Stats display                                                │ │
│ │ - Restart button                                               │ │
│ │                                                                │ │
│ │ Audio                                                          │ │
│ │                                                                │ │
│ │ game/Audio.ts                                                  │ │
│ │ - Web Audio API synthesis                                      │ │
│ │ - 9 sound effects                                              │ │
│ │ - Volume control                                               │ │
│ │                                                                │ │
│ │ 5. NUMBERED EXECUTION BLOCKS                                   │ │
│ │                                                                │ │
│ │ Block 1: Bullet System                                         │ │
│ │                                                                │ │
│ │ Files: game/entities/Bullet.ts, game/systems/BulletManager.ts, │ │
│ │  Ship.ts (update)                                              │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement bullet system for Asteroids React   │ │
│ │ port.                                                          │ │
│ │                                                                │ │
│ │ Create bullet spawning, movement, and TTL management:          │ │
│ │ 1. Bullet.ts entity with speed=70, life=1.1s, radius=0.2       │ │
│ │ 2. BulletManager to handle firing (0.16s cooldown), pooling,   │ │
│ │ updates                                                        │ │
│ │ 3. Ship integration: fire from nose, inherit velocity          │ │
│ │ 4. World wrapping at ±375,±249 bounds                          │ │
│ │                                                                │ │
│ │ Test: Hold Space spawns bullets every 160ms from ship nose,    │ │
│ │ bullets live 1.1s, wrap at edges.                              │ │
│ │ Output: Single diff to /diffs/bullets_[timestamp].diff, then   │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 2: Asteroid System                                       │ │
│ │                                                                │ │
│ │ Files: game/entities/Asteroid.ts, game/systems/Spawning.ts     │ │
│ │ (partial)                                                      │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement asteroid entities with ore types.   │ │
│ │                                                                │ │
│ │ Create asteroid system:                                        │ │
│ │ 1. Asteroid.ts with 3 sizes (r=6/3.5/2, score=20/50/100)       │ │
│ │ 2. Movement: baseSpeed=8 + random direction                    │ │
│ │ 3. Ore types: iron(90%), gold(7%), platinum(2.5%),             │ │
│ │ adamantium(0.5%)                                               │ │
│ │ 4. Split logic: large→2 medium, medium→2 small                 │ │
│ │ 5. Basic spawning for testing                                  │ │
│ │                                                                │ │
│ │ Test: Asteroids move, wrap, have correct sizes/colors by ore   │ │
│ │ type.                                                          │ │
│ │ Output: Single diff to /diffs/asteroids_[timestamp].diff, then │ │
│ │  commit.                                                       │ │
│ │                                                                │ │
│ │ Block 3: Collision System                                      │ │
│ │                                                                │ │
│ │ Files: game/systems/Collision.ts, integrate with entities      │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement collision detection and handling.   │ │
│ │                                                                │ │
│ │ Create collision system:                                       │ │
│ │ 1. Circle-circle detection using radii                         │ │
│ │ 2. Bullet↔asteroid: destroy bullet, damage asteroid, trigger   │ │
│ │ split                                                          │ │
│ │ 3. Ship↔asteroid: damage ship if not invulnerable              │ │
│ │ 4. Score addition on asteroid destruction                      │ │
│ │ 5. Particle bursts on hits                                     │ │
│ │                                                                │ │
│ │ Test: Bullets destroy asteroids, asteroids damage ship, scores │ │
│ │  update.                                                       │ │
│ │ Output: Single diff to /diffs/collision_[timestamp].diff, then │ │
│ │  commit.                                                       │ │
│ │                                                                │ │
│ │ Block 4: Wave Spawning                                         │ │
│ │                                                                │ │
│ │ Files: game/systems/Spawning.ts (complete), GameState.ts       │ │
│ │ (update)                                                       │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement wave progression system.            │ │
│ │                                                                │ │
│ │ Create wave spawning:                                          │ │
│ │ 1. Asteroid count: (3+wave)×2                                  │ │
│ │ 2. Spawn 20 units outside world bounds                         │ │
│ │ 3. Wave clear detection → next wave                            │ │
│ │ 4. GameState tracking wave number                              │ │
│ │ 5. Reset ship position on new wave                             │ │
│ │                                                                │ │
│ │ Test: Wave 1 has 8 asteroids, clearing all starts wave 2 with  │ │
│ │ 10.                                                            │ │
│ │ Output: Single diff to /diffs/waves_[timestamp].diff, then     │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 5: Enemy Hunters                                         │ │
│ │                                                                │ │
│ │ Files: game/entities/EnemyHunter.ts, Spawning.ts (update)      │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement enemy hunter AI and bosses.         │ │
│ │                                                                │ │
│ │ Create hunter system:                                          │ │
│ │ 1. Hunter entity: r=1.2, speed=26, fireRate=0.9s               │ │
│ │ 2. Strafing AI maintaining 14 unit distance                    │ │
│ │ 3. Boss sprites (boss1-10.png), random no-repeat               │ │
│ │ 4. Spawn wave≥3: count=min(1+floor((wave-2)/2), 4)             │ │
│ │ 5. Speed scaling: ×1.2 per boss level                          │ │
│ │                                                                │ │
│ │ Test: Wave 3 spawns 1 boss, moves/shoots at player, uses boss  │ │
│ │ sprite.                                                        │ │
│ │ Output: Single diff to /diffs/hunters_[timestamp].diff, then   │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 6: Particles & Debris                                    │ │
│ │                                                                │ │
│ │ Files: game/entities/Particles.ts, game/entities/Debris.ts     │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement particle and debris systems.        │ │
│ │                                                                │ │
│ │ Create visual effects:                                         │ │
│ │ 1. Particle bursts: configurable count, speed, color, life     │ │
│ │ 2. 220 pooled tetrahedron debris pieces                        │ │
│ │ 3. Physics: velocity, rotation, fade over time                 │ │
│ │ 4. Trigger on: hits, explosions, pickups                       │ │
│ │ 5. Performance: object pooling, auto-cleanup                   │ │
│ │                                                                │ │
│ │ Test: Shooting asteroids creates particle bursts and debris.   │ │
│ │ Output: Single diff to /diffs/particles_[timestamp].diff, then │ │
│ │  commit.                                                       │ │
│ │                                                                │ │
│ │ Block 7: Shield & Invulnerability                              │ │
│ │                                                                │ │
│ │ Files: Ship.ts (update), GameState.ts (update), Collision.ts   │ │
│ │ (update)                                                       │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement shield and invulnerability          │ │
│ │ mechanics.                                                     │ │
│ │                                                                │ │
│ │ Add protection systems:                                        │ │
│ │ 1. Invuln timers: 2s respawn, 3s wave start, 1s hit            │ │
│ │ 2. Shield visual: transparent sphere, opacity 0.6              │ │
│ │ 3. Shield charges from upgrades                                │ │
│ │ 4. Damage immunity during invuln                               │ │
│ │ 5. Visual feedback: ship flashing                              │ │
│ │                                                                │ │
│ │ Test: Ship invulnerable for 3s on wave start, 1s after hit.    │ │
│ │ Output: Single diff to /diffs/shields_[timestamp].diff, then   │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 8: HUD Implementation                                    │ │
│ │                                                                │ │
│ │ Files: ui/Hud.tsx, GameState.ts (selectors)                    │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement HUD with all game info displays.    │ │
│ │                                                                │ │
│ │ Create HUD elements:                                           │ │
│ │ 1. Wave counter (top-left)                                     │ │
│ │ 2. Currency display (top-right, glass effect, 32px font)       │ │
│ │ 3. Score with combo multiplier                                 │ │
│ │ 4. Combo timer bar (2.3s duration)                             │ │
│ │ 5. Upgrade history (bottom-left, max 8 items)                  │ │
│ │                                                                │ │
│ │ Test: All HUD elements visible, update in real-time during     │ │
│ │ play.                                                          │ │
│ │ Output: Single diff to /diffs/hud_[timestamp].diff, then       │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 9: Minimap                                               │ │
│ │                                                                │ │
│ │ Files: ui/Minimap.tsx                                          │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement tactical minimap display.           │ │
│ │                                                                │ │
│ │ Create minimap:                                                │ │
│ │ 1. 280×187 canvas (bottom-right)                               │ │
│ │ 2. Show all entities as colored dots                           │ │
│ │ 3. Player ship centered                                        │ │
│ │ 4. Scale to show full world                                    │ │
│ │ 5. Update every frame                                          │ │
│ │                                                                │ │
│ │ Test: Minimap shows all asteroids, enemies, player position.   │ │
│ │ Output: Single diff to /diffs/minimap_[timestamp].diff, then   │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 10: Upgrade System                                       │ │
│ │                                                                │ │
│ │ Files: game/systems/Upgrades.ts, ui/UpgradeMenu.tsx            │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement upgrade system with picker UI.      │ │
│ │                                                                │ │
│ │ Create upgrade system:                                         │ │
│ │ 1. 16 upgrades with rarity tiers (common→legendary)            │ │
│ │ 2. 3-choice picker with keyboard shortcuts (1/2/3)             │ │
│ │ 3. Mods object tracking: fireRateMul, engineMul, spread,       │ │
│ │ pierce, etc.                                                   │ │
│ │ 4. Apply effects to ship/bullets                               │ │
│ │ 5. Show after wave clear                                       │ │
│ │                                                                │ │
│ │ Test: Clearing wave shows 3 upgrades, selecting applies        │ │
│ │ effects.                                                       │ │
│ │ Output: Single diff to /diffs/upgrades_[timestamp].diff, then  │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 11: Currency & Pickups                                   │ │
│ │                                                                │ │
│ │ Files: game/entities/Pickup.ts, Spawning.ts (update)           │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement currency drops and collection.      │ │
│ │                                                                │ │
│ │ Create pickup system:                                          │ │
│ │ 1. Currency drops from asteroids by ore type                   │ │
│ │ 2. Drop rates: gold=27%, platinum=60%, adamantium=40%          │ │
│ │ 3. Magnetic collection radius (upgrade-able)                   │ │
│ │ 4. Float animation, auto-collect after 10s                     │ │
│ │ 5. Update currency in GameState                                │ │
│ │                                                                │ │
│ │ Test: Destroying gold asteroid has 27% chance to drop gold     │ │
│ │ pickup.                                                        │ │
│ │ Output: Single diff to /diffs/pickups_[timestamp].diff, then   │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 12: Hangar Shop                                          │ │
│ │                                                                │ │
│ │ Files: ui/HangarShop.tsx, GameState.ts (update)                │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement hangar shop every 3 waves.          │ │
│ │                                                                │ │
│ │ Create shop system:                                            │ │
│ │ 1. 6 items with salvage+rare costs                             │ │
│ │ 2. Items: Overclock(80s+2g), Quantum(80s+1p), Magnetic(40s),   │ │
│ │ Shield(30s), Drone(50s+1g), Ricochet(60s)                      │ │
│ │ 3. Show after waves 3,6,9...                                   │ │
│ │ 4. Purchase validation and application                         │ │
│ │ 5. Hangar.png background                                       │ │
│ │                                                                │ │
│ │ Test: Wave 3 clear shows hangar, can purchase with currency.   │ │
│ │ Output: Single diff to /diffs/hangar_[timestamp].diff, then    │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 13: Audio System                                         │ │
│ │                                                                │ │
│ │ Files: game/Audio.ts                                           │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement Web Audio API sound system.         │ │
│ │                                                                │ │
│ │ Create audio:                                                  │ │
│ │ 1. 9 effects: shoot(880Hz), hit(200Hz), explode(90Hz),         │ │
│ │ shield(440Hz), upgrade(660+990Hz), gameover(220Hz),            │ │
│ │ pickup(880Hz), shop(520Hz), ricochet(1200Hz)                   │ │
│ │ 2. Specific waveforms and durations per vanilla                │ │
│ │ 3. Volume control (pause menu)                                 │ │
│ │ 4. Trigger from game events                                    │ │
│ │ 5. No external files, all synthesized                          │ │
│ │                                                                │ │
│ │ Test: Shooting plays 880Hz square wave for 0.08s.              │ │
│ │ Output: Single diff to /diffs/audio_[timestamp].diff, then     │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 14: Game Flow Screens                                    │ │
│ │                                                                │ │
│ │ Files: ui/GameOverScreen.tsx, PauseOverlay.tsx (update),       │ │
│ │ GameLoop.ts (update)                                           │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Implement pause, restart, and game over.      │ │
│ │                                                                │ │
│ │ Complete game flow:                                            │ │
│ │ 1. Pause (ESC): show controls, sound settings                  │ │
│ │ 2. Restart (R): reset to wave 1                                │ │
│ │ 3. Game over: show stats, restart button                       │ │
│ │ 4. Debug console (F1/backtick)                                 │ │
│ │ 5. State transitions in GameLoop                               │ │
│ │                                                                │ │
│ │ Test: ESC pauses, R restarts, death shows game over screen.    │ │
│ │ Output: Single diff to /diffs/gameflow_[timestamp].diff, then  │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ Block 15: Final Parity Audit                                   │ │
│ │                                                                │ │
│ │ Files: All game files requiring constant tweaks                │ │
│ │ Prompt:                                                        │ │
│ │ EXECUTION MODE - Final parity audit against vanilla            │ │
│ │ implementation.                                                │ │
│ │                                                                │ │
│ │ Verify and fix:                                                │ │
│ │ 1. All constants match vanilla exactly (speeds, sizes,         │ │
│ │ timings)                                                       │ │
│ │ 2. World bounds: 750×498, visible: 150×99.6                    │ │
│ │ 3. Wrapping at ±375×±249                                       │ │
│ │ 4. Asset paths case-sensitive exact                            │ │
│ │ 5. All 16k stars with depth/brightness                         │ │
│ │ 6. Combo timing: 2.3s, decay 0.25/250ms                        │ │
│ │ 7. Wave formula: (3+wave)×2 asteroids                          │ │
│ │                                                                │ │
│ │ Test: Side-by-side with vanilla, identical behavior.           │ │
│ │ Output: Single diff to /diffs/parity_[timestamp].diff, then    │ │
│ │ commit.                                                        │ │
│ │                                                                │ │
│ │ 6. VERIFICATION PLAN                                           │ │
│ │                                                                │ │
│ │ Numeric Audits                                                 │ │
│ │                                                                │ │
│ │ - Extract all constants from vanilla main.js                   │ │
│ │ - Diff against React implementation                            │ │
│ │ - Verify speeds, radii, timings match exactly                  │ │
│ │                                                                │ │
│ │ Visual Comparison                                              │ │
│ │                                                                │ │
│ │ - Run vanilla and React side-by-side                           │ │
│ │ - Check: ship size (50px), asteroid sizes, UI positions        │ │
│ │ - Verify starfield density and depth                           │ │
│ │                                                                │ │
│ │ Behavioral Tests                                               │ │
│ │                                                                │ │
│ │ - Wave progression matches formula                             │ │
│ │ - Upgrade effects apply correctly                              │ │
│ │ - Currency drop rates accurate                                 │ │
│ │ - Audio frequencies/durations exact                            │ │
│ │                                                                │ │
│ │ Asset Validation                                               │ │
│ │                                                                │ │
│ │ - All paths case-sensitive correct                             │ │
│ │ - Boss sprites randomize without repeat                        │ │
│ │ - Overlays display at correct times                            │ │
│ │                                                                │ │
│ │ 7. DROP-IN READINESS (Planning Only)                           │ │
│ │                                                                │ │
│ │ Package Structure                                              │ │
│ │                                                                │ │
│ │ reactShell/                                                    │ │
│ │ ├── package.json (name: "asteroids-react")                     │ │
│ │ ├── vite.config.ts (base: './')                                │ │
│ │ ├── public/assets/ (preserved as-is)                           │ │
│ │ ├── src/                                                       │ │
│ │ │   ├── main.tsx (exports App)                                 │ │
│ │ │   └── [all game files]                                       │ │
│ │ └── dist/ (build output)                                       │ │
│ │                                                                │ │
│ │ Monorepo Integration Points                                    │ │
│ │                                                                │ │
│ │ - Export: export { App as default } from './App'               │ │
│ │ - Scripts: npm run build produces dist/                        │ │
│ │ - No hardcoded paths, all relative                             │ │
│ │ - Environment agnostic (no .env required)                      │ │
│ │ - Dev features behind DEBUG flag                               │ │
│ │                                                                │ │
│ │ Configuration Preservation                                     │ │
│ │                                                                │ │
│ │ - Vite config with base='./' for subpath deployment            │ │
│ │ - Public assets remain under public/                           │ │
│ │ - TypeScript config compatible with monorepo                   │ │
│ │ - No global pollution, all scoped                              │ │
│ │                                                                │ │
│ │ This completes the comprehensive plan for achieving exact      │ │
│ │ parity between the vanilla and React implementations, ready    │ │
│ │ for step-by-step execution by Sonnet.                          │ │
│ ╰────────────────────────────────────────────────────────────────╯ │