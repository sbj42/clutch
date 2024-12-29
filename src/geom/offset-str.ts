import { Offset } from "tiled-geometry";

const OFFSET_STR_REGEX = /^\(?(-?\d+)\s*,\s*(-?\d+)\)?$/;

export function offsetFromString(str: string): Offset {
    const match = OFFSET_STR_REGEX.exec(str);
    if (!match) {
        throw new Error('invalid offset ' + str);
    }
    return new Offset(parseInt(match[1], 10), parseInt(match[2], 10));
}
