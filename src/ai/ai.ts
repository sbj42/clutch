import { Vector } from "matter-js";
import type { Car } from "../race/car";
import { Race } from "../race/race";
import { TILE_SIZE } from "../track/tile";
import { Offset } from "tiled-geometry";

export type AiType = {
}

export class Ai {
    readonly race: Race;
    readonly car: Car;
    readonly type: Readonly<AiType>;

    private _nextTarget?: Offset;

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
        if (this._nextTarget) {
            if (this._nextTarget.x === x && this._nextTarget.y === y) {
                this._nextTarget = undefined;
            }
        }
        if (!this._nextTarget) {
            const pathDirs = this.race.track.pathfinders[checkpoint.index].getNextStep(x, y);
            const dir = pathDirs[Math.floor(Math.random() * pathDirs.length)];
            this._nextTarget = new Offset(x, y).addDirection(dir);
        }
        if (this._nextTarget) {
            const targetPosition = Vector.create((this._nextTarget.x + 0.5) * TILE_SIZE, (this._nextTarget.y + 0.5) * TILE_SIZE);
            const targetDir = Vector.normalise(Vector.sub(targetPosition, this.car.body.position));
            this.car.go(targetDir);
        } else {
            this.car.go(undefined);
        }
    }
}