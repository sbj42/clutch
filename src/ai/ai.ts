import { Vector } from "matter-js";
import type { Car } from "../thing/car";
import type { View } from "../view/view";

function randomVector() {
    return Vector.create(Math.random() * 2 - 1, Math.random() * 2 - 1);
}

export class Ai {
    view: View;
    car: Car;
    speed: number;

    private _anywhere?: Vector;
    private _anywhereTime = 0;

    constructor(car: Car, speed: number) {
        this.car = car;
        this.view = car.view;
        this.view.addAi(this);
        this.speed = speed;
    }

    tick(sec: number) {
        const checkpoint = this.view.checkpoints[this.car.nextCheckpoint];
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
            dir = Vector.normalise(Vector.sub(checkpoint.sensor.position, this.car.body.position));
        }
        this.car.go(Vector.mult(dir, this.speed));
    }
}