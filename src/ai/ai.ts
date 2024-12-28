import { Vector } from "matter-js";
import type { Car } from "../game/car";
import { Race } from "../game/race";
import { TILE_SIZE } from "../constants";

function randomVector() {
    return Vector.create(Math.random() - 0.5, Math.random() - 0.5);
}

export type AiType = {
    speed: number;
}

export class Ai {
    readonly race: Race;
    readonly car: Car;
    readonly type: Readonly<AiType>;

    private _anywhere?: Vector;
    private _anywhereTime = 0;

    constructor(race: Race, car: Car, type: AiType) {
        this.race = race;
        this.car = car;
        this.type = type;
    }

    tick(sec: number) {
        const checkpoint = this.car.state === 'finished' ? null : this.race.track.checkpoints[this.car.nextCheckpoint];
        let dir: Vector;
        if (!checkpoint) {
            if (this._anywhere && this._anywhereTime > 0) {
                this._anywhereTime -= sec;
            } else {
                this._anywhere = randomVector();
                this._anywhereTime = Math.random() + 0.5;
            }
            dir = this._anywhere;
        } else {
            const tileOffset = checkpoint.tile.offset;
            const position = Vector.mult(Vector.create(tileOffset.x + 0.5, tileOffset.y + 0.5), TILE_SIZE);
            dir = Vector.normalise(Vector.sub(position, this.car.body.position));
        }
        this.car.go(Vector.mult(dir, this.type.speed));
    }
}