import { Direction, Turn, turnFromDirections, turnToDegrees } from "tiled-geometry";

// Take angle in radians and return it in range [0, 2 * Math.PI)
export function fixAngle(value: number) {
    return value - Math.floor(value / (2 * Math.PI)) * (2 * Math.PI);
}

// Take angle in radians and return it in range [-Math.PI, Math.PI)
export function fixTurn(value: number) {
    return fixAngle(value + Math.PI) - Math.PI;
}

export function turnToRadians(turn: Turn): number {
    return turnToDegrees(turn) * Math.PI / 180;
}

export function directionToRadians(dir: Direction): number {
    return turnToRadians(turnFromDirections(Direction.NORTH, dir));
}