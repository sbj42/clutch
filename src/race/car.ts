import { Body, Collision, Vector } from "matter-js";
import { fixAngle, fixTurn } from "../geom/angle";
import { Race } from "./race";
import { CarType } from "./car-type";

export type CarState = 'before-start' | 'racing' | 'finishing' | 'finished';

// better, but need to fix ai first:
// const ACCELERATION = 0.10;
// const MAX_SPEED = 18;

const ACCELERATION = 0.15;
const MAX_SPEED = 15;
// radians per second
const TURN_SPEED = 2 * Math.PI;
// when the car's speed is this much slower than desired, it skids
const BURNOUT_SPEED_DIFF = 0.35;
// when the car's angle is this much off from the travel angle, it drifts
const DRIFT_ANGLE_DIFF = Math.PI / 3;
// the car must be going this fast or else it's not drifting
const DRIFT_SPEED = 0.4;

export type Finished = {
    place: number;
    time: number;
}

export class Car {
    readonly index: number;
    readonly race: Race;
    readonly body: Body;
    readonly type: CarType;

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

    get maxSpeed() {
        return MAX_SPEED;
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
            this._desiredAngle = Vector.angle(Vector.create(0, 0), direction);
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
            const turnSpeed = TURN_SPEED * sec;
            if (Math.abs(angleDiff) < turnSpeed) {
                Body.setAngle(this.body, targetAngle);
            } else {
                Body.setAngle(this.body, fixAngle(this.body.angle + Math.sign(targetAngle - this.body.angle) * turnSpeed));
            }
        }
        let desiredSpeed = this._desiredSpeed;
        if (desiredSpeed !== undefined) {
            const speedDiff = desiredSpeed - this.body.speed / MAX_SPEED;
            if (speedDiff > BURNOUT_SPEED_DIFF) {
                this._burnout = true;
            }
            const targetSpeed = Vector.mult(Vector.rotate(Vector.create(1, 0), this.body.angle), MAX_SPEED * desiredSpeed);
            const toward = Vector.sub(targetSpeed, this.body.velocity);
            const mag = Vector.magnitude(toward);
            const acceleration = ACCELERATION * sec;
            if (mag < acceleration) {
                Body.setVelocity(this.body, targetSpeed);
            } else {
                Body.applyForce(this.body, this.body.position, Vector.mult(toward, acceleration / mag));
            }
        } else {
            this._idle = true;
        }

        this._checkCheckpoint();

        const sideways = fixTurn(this.body.angle - Vector.angle(Vector.create(0, 0), this.body.velocity));
        if (Math.abs(sideways) > DRIFT_ANGLE_DIFF && this.body.speed > DRIFT_SPEED * MAX_SPEED) {
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