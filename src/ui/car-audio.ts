import { Car } from "../race/car";
import { Vector } from "matter-js";
import type { RaceUi } from "./race-ui";
import { Howl } from "howler";
import { TILE_SIZE } from "../track/tile";

const ENGINE_SOUNDSOURCE = new URL(
    '../../audio/engine.flac',
    import.meta.url
);

export const MIN_RATE = 0.8;
export const MAX_RATE = 2.3;

export const BASE_VOLUME = 0.2;
export const PLAYER_VOLUME_BOOST = 0.05;
export const DOPPLER_MAX_SPEED = 15;
export const DOPPLER_EFFECT = 0.2;
export const MAX_DISTANCE = TILE_SIZE * 3;

const QUIET_MULTIPLIER = 0.3;
const QUIET_TIME = 1;

const VEC = Vector.create();

export class CarAudio {
    readonly raceUi: RaceUi;
    readonly car: Car;
    private _engine: Howl;
    private _delta: number;

    private _multiplier = 1;
    private _quiet = false;

    constructor(raceUi: RaceUi, car: Car) {
        this.raceUi = raceUi;
        this.car = car;
        this.raceUi.audio.addCar(this);
        this._engine = new Howl({
            src: [ENGINE_SOUNDSOURCE.href],
            loop: true,
            volume: 0.2,
        });
        this._engine.seek(2 * (car.index / raceUi.race.cars.length));
        this._delta = (Math.random() * 2 - 1) * 0.04;
        this._engine.rate(MIN_RATE + this._delta);
        this._engine.play();
    }

    tick(sec: number) {
        const player = this.raceUi.race.player;
        if (this._quiet && this._multiplier > QUIET_MULTIPLIER) {
            this._multiplier -= sec / QUIET_TIME;
        }

        const body = this.car.body;
        VEC.x = body.position.x - player.body.position.x;
        VEC.y = body.position.y - player.body.position.y;
        const distance = Vector.magnitude(VEC);
        const doppler = distance > 0 ? -Vector.dot(VEC, body.velocity) / distance / DOPPLER_MAX_SPEED : 0;

        this._engine.stereo(Math.min(1, Math.max(-1, VEC.x / (TILE_SIZE * 2))));

        const boost = this.car.isPlayer ? PLAYER_VOLUME_BOOST : 0;
        const volume = (BASE_VOLUME * Math.max(0, 1 - distance / MAX_DISTANCE) + boost) * this._multiplier;
        this._engine.volume(volume);

        const speed = this.car.body.speed / this.car.type.maxSpeed;
        const newRate = MIN_RATE + (MAX_RATE - MIN_RATE) * speed + this._delta + doppler * DOPPLER_EFFECT;
        if (Math.abs(newRate - this._engine.rate()) > 0.02 && volume > 0) {
            this._engine.rate(newRate);
        }
    }

    pause(pause: boolean) {
        if (pause) {
            this._engine.pause();
        } else {
            this._engine.play();
        }
    }

    quiet() {
        this._quiet = true;
    }

    destroy() {
        this._engine.stop();
    }
}
