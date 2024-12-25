import { Vector } from "matter-js";
import pressed from 'pressed';

const NORTH = Vector.create(0, -1);
const dirkeys = {
    'Up': NORTH,
    'Right': Vector.rotate(NORTH, 1 * Math.PI / 2),
    'Down': Vector.rotate(NORTH, 2 * Math.PI / 2),
    'Left': Vector.rotate(NORTH, 3 * Math.PI / 2),
    'W': NORTH,
    'D': Vector.rotate(NORTH, 1 * Math.PI / 2),
    'S': Vector.rotate(NORTH, 2 * Math.PI / 2),
    'A': Vector.rotate(NORTH, 3 * Math.PI / 2),
};
export function getInputDirection() {
    let offset = Vector.create(0, 0);
    const shift = pressed('Shift');
    for (const key in dirkeys) {
        if (pressed(key)) {
            offset = Vector.add(offset, dirkeys[key]);
        }
    }
    return Vector.mult(offset, Math.min(1, 1 / Vector.magnitude(offset)) * (shift ? 0.5 : 1));
}
