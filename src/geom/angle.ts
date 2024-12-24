export function fixAngle(value: number) {
    return value - Math.floor(value / 360) * 360;
}

export function fixTurn(value: number) {
    return fixAngle(value + 180) - 180;
}
