// units.ts - World unit to pixel conversion utilities

// Vanilla world constants
export const WORLD_WIDTH = 750
export const WORLD_HEIGHT = 498
export const VISIBLE_HEIGHT = 99.6 // Visible world units vertically (1/5 of world height)

// Conversion utilities for maintaining visual parity
export function pxToWorld(px: number, viewportHeight: number): number {
  // Convert desired pixel size to world units based on current viewport
  return (px * VISIBLE_HEIGHT) / viewportHeight
}

export function worldToPx(units: number, viewportHeight: number): number {
  // Convert world units to pixel size based on current viewport
  return (units * viewportHeight) / VISIBLE_HEIGHT
}

// Helper to get visible width based on aspect ratio
export function getVisibleWidth(aspectRatio: number): number {
  return VISIBLE_HEIGHT * aspectRatio
}

// World wrapping boundaries
export const WORLD_BOUNDS = {
  x: WORLD_WIDTH / 2,  // ±375
  y: WORLD_HEIGHT / 2, // ±249
}