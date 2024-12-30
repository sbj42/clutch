import type { RaceUi } from "./race-ui";
import { CarAudio } from "./car-audio";

export class RaceAudio {
    readonly raceUi: RaceUi;

    private readonly _cars: CarAudio[] = [];

    constructor(raceUi: RaceUi) {
        this.raceUi = raceUi;
    }

    addCar(carAudio: CarAudio) {
        this._cars.push(carAudio);
    }

    pause(pause: boolean) {
        for (const carAudio of this._cars) {
            carAudio.pause(pause);
        }
    }

    destroy() {
        for (const carAudio of this._cars) {
            carAudio.destroy();
        }
    }
}
