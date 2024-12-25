import { Car } from "./thing/car";
import { Map } from "./map/map";
import { View } from "./view/view";
import pressed from 'pressed';
import { TILE_SIZE } from "./map/tile";
import { Vector } from "matter-js";
import { Ai } from "./ai/ai";

const top = document.getElementById('top')!;
const view = new View(top);
const map = new Map(view, Vector.create(3, 3));
const player = Car.create(view, 0, Vector.create(TILE_SIZE / 2, TILE_SIZE / 2));
view.player = player;

const overlay = document.createElement('div');
overlay.style.setProperty('position', 'absolute');
overlay.style.setProperty('inset', '0');
overlay.style.setProperty('display', 'flex');
overlay.style.setProperty('align-items', 'center');
overlay.style.setProperty('justify-content', 'center');
top.appendChild(overlay);
const countdownDiv = document.createElement('div');
countdownDiv.style.setProperty('font-size', '200px');
countdownDiv.style.setProperty('font-family', 'monospace');
countdownDiv.style.setProperty('color', 'white');
overlay.appendChild(countdownDiv);

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
