export const TILE_SIZE = 600;

export const STANDARD_TRACK_WIDTH = TILE_SIZE * 0.5;
export const STANDARD_TRACK_RADIUS = TILE_SIZE * 0.1;

export const MINIMAP_SCALE = 0.1;

// these pixels around the edge of the car are excluded from collision detection
export const COLLISION_INSET = 2;
export const ACCELERATION = 0.15;
export const MAX_SPEED = 15;
// radians per second
export const TURN_SPEED = 2 * Math.PI;
// when the car's speed is this much slower than desired, it skids
export const SKID_SPEED_DIFF = 0.4;
// when the car's angle is this much off from the travel angle, it skids
export const SKID_ANGLE_DIFF = Math.PI / 3;
// when skidding due to angle, the car must be going this fast
export const SKID_ANGLE_SPEED = 0.4;