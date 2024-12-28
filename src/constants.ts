export const TILE_SIZE = 600;

export const STANDARD_TRACK_WIDTH = TILE_SIZE * 0.5;
export const NARROW_TRACK_WIDTH = TILE_SIZE * 0.3;
export const BARRIER_THICKNESS = 15;

export const ACCELERATION = 0.15;
export const MAX_SPEED = 15;
// radians per second
export const TURN_SPEED = 2 * Math.PI;
// when the car's speed is this much slower than desired, it skids
export const BURNOUT_SPEED_DIFF = 0.35;
// when the car's angle is this much off from the travel angle, it drifts
export const DRIFT_ANGLE_DIFF = Math.PI / 3;
// the car must be going this fast or else it's not drifting
export const DRIFT_SPEED = 0.4;