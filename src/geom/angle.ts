export function fixAngle(value: number) {
    return value - Math.floor(value / (2 * Math.PI)) * (2 * Math.PI);
}

export function fixTurn(value: number) {
    return fixAngle(value + Math.PI) - Math.PI;
}
