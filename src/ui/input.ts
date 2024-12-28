import { Direction, Offset } from 'tiled-geometry';
import pressed from 'pressed';
import { Vector } from 'matter-js';

pressed.start();

const dirkeys = {
    'Up': Direction.NORTH,
    'Right': Direction.EAST,
    'Down': Direction.SOUTH,
    'Left': Direction.WEST,
    'W': Direction.NORTH,
    'D': Direction.EAST,
    'S': Direction.SOUTH,
    'A': Direction.WEST,
};
const INPUT_OFFSET = new Offset();
export function getInputDirection() {
    INPUT_OFFSET.set(0, 0);
    const shift = pressed('Shift');
    for (const key in dirkeys) {
        if (pressed(key)) {
            INPUT_OFFSET.addDirection(dirkeys[key]);
        }
    }
    return Vector.mult(INPUT_OFFSET, Math.min(1, 1 / Vector.magnitude(INPUT_OFFSET)) * (shift ? 0.5 : 1));
}
