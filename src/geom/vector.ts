import { Vector } from "matter-js";
import { Direction, Turn, turnFromDirections, turnToDegrees } from "tiled-geometry";

// matter-js Vector.angle requires two vectors
export function getAngle(vector: Vector) {
    return Math.atan2(vector.y, vector.x);
}

// matter-js Vector.normalise allocates a new vector
export function normalizeInPlace(vector: Vector) {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude === 0) {
        vector.x = 0;
        vector.y = 0;
    } else {
        vector.x /= magnitude;
        vector.y /= magnitude;
    }
}

// @types/matter-js is missing the three-argument version of Vector.rotate
export function rotateInPlace(vector: Vector, angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = vector.x;
    const y = vector.y;
    vector.x = x * cos - y * sin;
    vector.y = x * sin + y * cos;
}