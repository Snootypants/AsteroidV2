// src/game/systems/Starfield.ts
import * as THREE from "three";
import { WORLD_BOUNDS } from "../utils/units";

export function createStarfield(scene: THREE.Scene, count = 300) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const x = WORLD_BOUNDS.minX + Math.random() * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX);
    const y = WORLD_BOUNDS.minY + Math.random() * (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY);
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = -10;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({ size: 1.2, sizeAttenuation: true });
  mat.depthWrite = false; 
  mat.depthTest = false; 
  mat.transparent = true;

  const points = new THREE.Points(geom, mat);
  points.renderOrder = -1;
  scene.add(points);

  function wrap() {
    const pos = geom.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let x = pos.getX(i), y = pos.getY(i);
      if (x < WORLD_BOUNDS.minX) x = WORLD_BOUNDS.maxX;
      if (x > WORLD_BOUNDS.maxX) x = WORLD_BOUNDS.minX;
      if (y < WORLD_BOUNDS.minY) y = WORLD_BOUNDS.maxY;
      if (y > WORLD_BOUNDS.maxY) y = WORLD_BOUNDS.minY;
      pos.setX(i, x); pos.setY(i, y);
    }
    pos.needsUpdate = true;
  }

  return { update(_: number) { wrap(); } };
}