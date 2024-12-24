import { Car } from "./thing/car";
import { Point } from "./geom/point";
import { Map } from "./map/map";
import { View } from "./view/view";
import pressed from 'pressed';
import { TILE_SIZE } from "./map/tile";

const view = new View();
const map = new Map(view, new Point(3, 3));
const player = new Car(view, new Point(TILE_SIZE / 2, TILE_SIZE / 2), 0);

pressed.start();

const NORTH = new Point(0, -1);
const dirkeys = {
    'Up': NORTH,
    'Right': NORTH.rotate(90),
    'Down': NORTH.rotate(180),
    'Left': NORTH.rotate(270),
    'W': NORTH,
    'D': NORTH.rotate(90),
    'S': NORTH.rotate(180),
    'A': NORTH.rotate(270),
};
function getInputDirection() {
    let offset = Point.ORIGIN;
    const shift = pressed('Shift');
    for (const key in dirkeys) {
        if (pressed(key)) {
            offset = offset.add(dirkeys[key]);
        }
    }
    return offset.multiply(Math.min(1, 1 / offset.magnitude())).multiply(shift ? 0.5 : 1);
}

function tick(sec: number) {
    const offset = getInputDirection();
    player.go(getInputDirection());
    player.tick(sec);
    view.prep(player.location);
    for (const tile of map.tiles) {
        view.draw();
    }
    view.draw();
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
