import { SMALL1 } from "./track/tracks/small1";
import { Race } from "./game/race";
import { getStandardCarType } from "./game/car-type";
import { RaceUi } from "./ui/race-ui";

const track = SMALL1;
const race = new Race(track, [
    { type: getStandardCarType(0), ai: undefined },
    { type: getStandardCarType(1), ai: { speed: 0.7 } },
    { type: getStandardCarType(2), ai: { speed: 0.8 } },
    { type: getStandardCarType(3), ai: { speed: 0.9 } },
    { type: getStandardCarType(4), ai: { speed: 1.0 } },
], 3);
const ui = new RaceUi(document.getElementById('ui')!, race, { wireframe: true });

function tick(sec: number) {
    race.tick(sec);
    ui.tick(sec);
    ui.update();
}

let lastTime = -1;
function rafCallback(time: number) {
    if (lastTime < 0) {
        lastTime = time;
    } else {
        try {
            tick(Math.min(time - lastTime, 16.666) / 1000);
        } catch (e) {
            console.error(e);
        }
        lastTime = time;
    }
    requestAnimationFrame(rafCallback);
}
requestAnimationFrame(rafCallback);
