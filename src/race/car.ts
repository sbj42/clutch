import { Body, Collision, Vector } from "matter-js";
import { fixAngle, fixTurn } from "../geom/angle";
import { Race } from "./race";
import { CarType } from "./car-type";
import { getAngle, rotateInPlace } from "../geom/vector";

export type CarState = 'before-start' | 'racing' | 'finishing' | 'finished';

// when the car's speed is this much slower than desired, it skids
const BURNOUT_SPEED_DIFF = 0.35;
// when the car's angle is this much off from the travel angle, it drifts
const DRIFT_ANGLE_DIFF = Math.PI / 3;
// the car must be going this fast or else it's not drifting
const DRIFT_SPEED = 0.4;

export type CarSettings = {
    acceleration: number;
    maxSpeed: number;
    turnSpeed: number;
};

export type Finished = {
    place: number;
    time: number;
}

const VEC_TARGET_VELOCITY = Vector.create();
const VEC_VELOCITY_DELTA = Vector.create();

export class Car {
    readonly index: number;
    readonly race: Race;
    readonly body: Body;
    readonly type: Readonly<CarType>;

    private _lap = 0;
    private _finished?: Finished;
    private _nextCheckpoint = 0;

    private _desiredAngle: number | undefined;
    private _desiredSpeed: number | undefined;

    private _burnout: boolean;
    private _drift: boolean;
    private _idle: boolean;

    constructor(race: Race, index: number, body: Body, type: CarType) {
        this.index = index;
        this.race = race;
        this.body = body;
        this.type = type;
        this._desiredAngle = undefined;
        this._desiredSpeed = 0;
    }

    get almostFinished() {
        return this._lap === this.race.laps && this._nextCheckpoint === this.race.track.checkpoints.length - 1;
    }

    get finished() {
        return this._finished;
    }

    get lap() {
        return this._lap;
    }

    get nextCheckpoint() {
        return this._nextCheckpoint;
    }

    get burnout() {
        return this._burnout;
    }

    get drift() {
        return this._drift;
    }

    get idle() {
        return this._idle;
    }

    get isPlayer() {
        return this === this.race.player;
    }

    go(direction?: Vector) {
        if (!direction) {
            this._desiredAngle = undefined;
            this._desiredSpeed = undefined;
            return;
        }
        const mag = Vector.magnitude(direction);
        if (mag > 0.01) {
            this._desiredAngle = getAngle(direction);
            this._desiredSpeed = mag;
        } else {
            this._desiredAngle = undefined;
            this._desiredSpeed = 0;
        }
    }

    tick(sec: number) {
        let targetAngle = this._desiredAngle;
        this._burnout = false;
        this._drift = false;
        this._idle = false;
        if (this.body.angularSpeed > 0) {
            Body.setAngularSpeed(this.body, Math.max(0, this.body.angularSpeed - 0.025 * sec));
        }
        if (targetAngle !== undefined) {
            const angleDiff = fixTurn(targetAngle - this.body.angle);
            if (targetAngle > this.body.angle + Math.PI) {
                targetAngle -= 2 * Math.PI;
            } else if (targetAngle < this.body.angle - Math.PI) {
                targetAngle += 2 * Math.PI;
            }
            const turnSpeed = this.type.turnSpeed * sec;
            if (Math.abs(angleDiff) < turnSpeed) {
                Body.setAngle(this.body, targetAngle);
            } else {
                Body.setAngle(this.body, fixAngle(this.body.angle + Math.sign(targetAngle - this.body.angle) * turnSpeed));
            }
        }
        let desiredSpeed = this._desiredSpeed;
        if (desiredSpeed !== undefined) {
            const speedDiff = desiredSpeed - this.body.speed / this.type.maxSpeed;
            if (speedDiff > BURNOUT_SPEED_DIFF) {
                this._burnout = true;
            }
            VEC_TARGET_VELOCITY.x = this.type.maxSpeed * desiredSpeed;
            VEC_TARGET_VELOCITY.y = 0;
            rotateInPlace(VEC_TARGET_VELOCITY, this.body.angle);
            VEC_VELOCITY_DELTA.x = VEC_TARGET_VELOCITY.x - this.body.velocity.x;
            VEC_VELOCITY_DELTA.y = VEC_TARGET_VELOCITY.y - this.body.velocity.y;
            const mag = Vector.magnitude(VEC_VELOCITY_DELTA);
            const acceleration = this.type.acceleration * sec;
            if (mag < acceleration) {
                Body.setVelocity(this.body, VEC_TARGET_VELOCITY);
            } else {
                VEC_VELOCITY_DELTA.x *= acceleration / mag;
                VEC_VELOCITY_DELTA.y *= acceleration / mag;
                Body.applyForce(this.body, this.body.position, VEC_VELOCITY_DELTA);
            }
        } else {
            this._idle = true;
        }

        this._checkCheckpoint();

        const sideways = fixTurn(this.body.angle - getAngle(this.body.velocity));
        if (Math.abs(sideways) > DRIFT_ANGLE_DIFF && this.body.speed > DRIFT_SPEED * this.type.maxSpeed) {
            this._drift = true;
        }
    }

    private _checkCheckpoint() {
        if (this._finished) {
            return;
        }
        if (this._lap === 0) {
            const sensor = this.race.getStartSensor();
            if (Collision.collides(this.body, sensor)) {
                this._lap = 1;
            }
        } else {
            const sensor = this.race.getCheckpointSensor(this._nextCheckpoint);
            if (Collision.collides(this.body, sensor)) {
                if (this._nextCheckpoint < this.race.track.checkpoints.length - 1) {
                    this._nextCheckpoint++;
                } else {
                    this._lap ++;
                    this._nextCheckpoint = 0;
                    if (this._lap > this.race.laps) {
                        this._finished = {
                            place: this.race.claimPlace(),
                            time: this.race.time,
                        };
                    }
                }
            }   
        }
    }

}