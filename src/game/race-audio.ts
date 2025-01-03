import type { RaceUi } from './race-ui';
import { CarAudio } from './car-audio';
import { Howler } from 'howler';

export class RaceAudio {
    readonly raceUi: RaceUi;

    private readonly _cars: CarAudio[] = [];

    constructor(raceUi: RaceUi) {
        this.raceUi = raceUi;
        Howler.volume(raceUi.gameOptions.engineVolume);
    }

    addCar(carAudio: CarAudio) {
        this._cars.push(carAudio);
    }

    pause(pause: boolean) {
        for (const carAudio of this._cars) {
            carAudio.pause(pause);
        }
    }

    quiet() {
        for (const carAudio of this._cars) {
            carAudio.quiet();
        }
    }

    destroy() {
        for (const carAudio of this._cars) {
            carAudio.destroy();
        }
    }
}
