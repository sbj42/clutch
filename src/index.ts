import { Car } from "./thing/car";
import { Map } from "./map/map";
import { View } from "./view/view";
import pressed from 'pressed';
import { TILE_SIZE } from "./map/tile";
import { Vector } from "matter-js";

const view = new View();
const map = new Map(view, Vector.create(3, 3));
const player = Car.create(view, 0, Vector.create(TILE_SIZE / 2, TILE_SIZE / 2));
view.player = player;

pressed.start();

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
function getInputDirection() {
    let offset = Vector.create(0, 0);
    const shift = pressed('Shift');
    for (const key in dirkeys) {
        if (pressed(key)) {
            offset = Vector.add(offset, dirkeys[key]);
        }
    }
    return Vector.mult(offset, Math.min(1, 1 / Vector.magnitude(offset)) * (shift ? 0.5 : 1));
}

function tick(sec: number) {
    player.go(getInputDirection());
    view.tick(sec);
}

let lastTime = -1;
function rafCallback(time: number) {
    if (lastTime < 0) {
        lastTime = time;
    } else {
        try {
            tick((time - lastTime) / 1000);
        } catch (e) {
            console.error(e);
        }
        lastTime = time;
    }
    requestAnimationFrame(rafCallback);
}
requestAnimationFrame(rafCallback);
