import { Direction, DIRECTIONS, directionToString } from "tiled-geometry";

const DIRECTIONS_STR_MAP: Record<string, Direction> = {};

for (const dir of DIRECTIONS) {
    DIRECTIONS_STR_MAP[directionToString(dir)] = dir;
}

export function directionFromString(str: string): Direction {
    const dir = DIRECTIONS_STR_MAP[str];
    if (dir === undefined) {
        throw new Error('invalid direction ' + str);
    }
    return dir;
}
