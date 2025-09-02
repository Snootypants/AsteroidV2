// src/game/utils/units.ts
export type WorldBounds = { minX: number; maxX: number; minY: number; maxY: number };

export let WORLD_BOUNDS: WorldBounds = { minX: -375, maxX: 375, minY: -249, maxY: 249 };

export function configureWorld(): void {
  // lock to original extents; 1 world unit = 1 pixel
  WORLD_BOUNDS = { minX: -375, maxX: 375, minY: -249, maxY: 249 };
}

export function getWorldSize() { return { width: 750, height: 498 }; }

export function pxToWorld(n: number) { return n; }