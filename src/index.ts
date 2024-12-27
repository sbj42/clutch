import { Car } from "./thing/car";
import { Map } from "./map/map";
import { View } from "./view/view";
import pressed from 'pressed';
import { Vector } from "matter-js";
import { Ai } from "./ai/ai";
import { MINIMAP_SCALE, TILE_SIZE } from "./constants";

const top = document.getElementById('top')!;
top.style.setProperty('font-family', 'monospace');
top.style.setProperty('color', 'white');
const view = new View(top);
const map = new Map(view, Vector.create(3, 3));
const player = Car.create(view, 0, Vector.create(TILE_SIZE / 2, TILE_SIZE / 2));
view.player = player;

const overlay = document.createElement('div');
overlay.style.setProperty('position', 'absolute');
overlay.style.setProperty('inset', '0');
overlay.style.setProperty('display', 'flex');
overlay.style.setProperty('flex-direction', 'column');
top.appendChild(overlay);
const topDiv = document.createElement('div');
topDiv.style.setProperty('flex', '0');
topDiv.style.setProperty('display', 'flex');
overlay.appendChild(topDiv);
const lapDiv = document.createElement('div');
lapDiv.style.setProperty('font-size', '50px');
lapDiv.style.setProperty('flex', '1');
topDiv.appendChild(lapDiv);
const minimapDiv = document.createElement('div');
minimapDiv.style.setProperty('position', 'relative');
minimapDiv.style.setProperty('background-color', 'black');
minimapDiv.style.setProperty('width', `${TILE_SIZE * map.size.x * MINIMAP_SCALE}px`);
minimapDiv.style.setProperty('height', `${TILE_SIZE * map.size.y * MINIMAP_SCALE}px`);
for (let y = 0; y < map.size.y; y++) {
    for (let x = 0; x < map.size.x; x++) {
        const minitile = map.getTile(x, y).elem.cloneNode(true) as HTMLElement;
        minitile.style.setProperty('transform-origin', `0 0`);
        minitile.style.setProperty('scale', `${MINIMAP_SCALE}`);
        minitile.style.setProperty('left', (x * TILE_SIZE * MINIMAP_SCALE) + 'px');
        minitile.style.setProperty('top', (y * TILE_SIZE * MINIMAP_SCALE) + 'px');
        minimapDiv.appendChild(minitile);
    }
}
topDiv.appendChild(minimapDiv);
const middleDiv = document.createElement('div');
middleDiv.style.setProperty('flex', '1');
middleDiv.style.setProperty('display', 'flex');
middleDiv.style.setProperty('align-items', 'center');
middleDiv.style.setProperty('justify-content', 'center');
overlay.appendChild(middleDiv);
const countdownDiv = document.createElement('div');
countdownDiv.style.setProperty('font-size', '200px');
middleDiv.appendChild(countdownDiv);

let countdown = 3;

const other1 = Car.create(view, 1, Vector.create(TILE_SIZE / 2, TILE_SIZE / 2 - 128));
const ai1 = new Ai(other1, 0.7);
const other2 = Car.create(view, 2, Vector.create(TILE_SIZE / 2, TILE_SIZE / 2 - 64));
const ai2 = new Ai(other2, 0.8);
const other3 = Car.create(view, 3, Vector.create(TILE_SIZE / 2, TILE_SIZE / 2 + 64));
const ai3 = new Ai(other3, 0.9);
const other4 = Car.create(view, 4, Vector.create(TILE_SIZE / 2, TILE_SIZE / 2 + 128));
const ai4 = new Ai(other4, 1.0);

pressed.start();

function tick(sec: number) {
    if (!view.active) {
        countdown -= sec;
        if (countdown > 0) {
            countdownDiv.innerHTML = String(Math.ceil(countdown));
        } else {
            countdownDiv.innerHTML = '';
            view.active = true;
        }
    } else if (player.place) {
        lapDiv.textContent = `#${player.place}`;
    } else {
        lapDiv.textContent = `${player.lap}/${map.laps}`;
    }
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
