// Take angle in radians and return it in range [0, 2 * Math.PI)
export function fixAngle(value: number) {
    return value - Math.floor(value / (2 * Math.PI)) * (2 * Math.PI);
}

// Take angle in radians and return it in range [-Math.PI, Math.PI)
export function fixTurn(value: number) {
    return fixAngle(value + Math.PI) - Math.PI;
}
