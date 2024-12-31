import { Vector } from "matter-js";
import type { Car } from "../race/car";
import { Race } from "../race/race";
import { TILE_SIZE } from "../track/tile";
import { Offset } from "tiled-geometry";
import { normalizeInPlace } from "../geom/vector";

export type AiType = {
}

const VEC = Vector.create();

export class Ai {
    readonly race: Race;
    readonly car: Car;
    readonly type: Readonly<AiType>;

    private _target = new Offset();
    private _newTarget = true;

    constructor(race: Race, car: Car, type: AiType) {
        this.race = race;
        this.car = car;
        this.type = type;
    }

    tick(sec: number) {
        if (this.car.finished) {
            this.car.go(undefined);
            return;
        }
        const checkpoint = this.race.track.checkpoints[this.car.nextCheckpoint];
        const position = this.car.body.position;
        const x = Math.floor(position.x / TILE_SIZE);
        const y = Math.floor(position.y / TILE_SIZE);
        this._newTarget ||= this._target.x === x && this._target.y === y;
        if (this._newTarget) {
            const pathDirs = this.race.track.pathfinders[checkpoint.index].getNextStep(x, y);
            const dir = pathDirs[Math.floor(Math.random() * pathDirs.length)];
            this._target.set(x, y).addDirection(dir);
            this._newTarget = false;
        }
        VEC.x = (this._target.x + 0.5) * TILE_SIZE - position.x;
        VEC.y = (this._target.y + 0.5) * TILE_SIZE - position.y;
        normalizeInPlace(VEC);
        this.car.go(VEC);
    }
}