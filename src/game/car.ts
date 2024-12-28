import { Body, Collision, Vector } from "matter-js";
import { fixAngle, fixTurn } from "../geom/angle";
import { ACCELERATION, MAX_SPEED, DRIFT_ANGLE_DIFF, DRIFT_SPEED, BURNOUT_SPEED_DIFF, TURN_SPEED } from "../constants";
import { Race } from "./race";
import { CarType } from "./car-type";

export type CarState = 'before-start' | 'racing' | 'finishing' | 'finished';

export class Car {
    readonly race: Race;
    readonly body: Body;
    readonly type: CarType;

    private _lap = 0;
    private _place = 0;
    private _nextCheckpoint = 0;

    private _desiredAngle: number | undefined;
    private _desiredSpeed: number | undefined;

    private _burnout: boolean;
    private _drift: boolean;
    private _idle: boolean;

    constructor(race: Race, body: Body, type: CarType) {
        this.race = race;
        this.body = body;
        this.type = type;
        this._desiredAngle = undefined;
        this._desiredSpeed = 0;
    }

    get state(): CarState {
        return this._lap === 0 ? 'before-start'
            : this._place ? 'finished'
            : this._lap < this.race.laps || this._nextCheckpoint !== 0 ? 'racing'
            : 'finishing';
    }

    get lap() {
        return this._lap;
    }

    get place() {
        return this._place;
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
        // const backCenter = Vector.add(this.body.position, Vector.rotate(Vector.create(-SIZE.x * 0.4, 0), this.body.angle));
        // if (Math.random() < 0.08 + 0.1 * skids) {
        //     const back = Vector.mult(Vector.rotate(Vector.create(-1, 0), this.body.angle), MAX_SPEED / 5);
        //     new Cloud(this.view, backCenter, Vector.add(this.body.velocity, back));
        // }
        // if (skids >= 2) {
        //     const backLeftTire = Vector.add(this.body.position, Vector.rotate(Vector.create(-SIZE.x * 0.4, -SIZE.y * 0.35), this.body.angle));
        //     this.trailBackLeft ??= new Trail(this.view, 3, 'black');
        //     this.trailBackLeft.elem.style.setProperty('opacity', '0.25');
        //     this.trailBackLeft.add(backLeftTire);
        //     const backRightTire = Vector.add(this.body.position, Vector.rotate(Vector.create(-SIZE.x * 0.4, SIZE.y * 0.35), this.body.angle));
        //     this.trailBackRight ??= new Trail(this.view, 3, 'black');
        //     this.trailBackRight.elem.style.setProperty('opacity', '0.25');
        //     this.trailBackRight.add(backRightTire);
        // } else {
        //     this.trailBackLeft = this.trailBackRight = undefined;
        // }
        // if (skids >= 4) {
        //     const frontLeftTire = Vector.add(this.body.position, Vector.rotate(Vector.create(SIZE.x * 0.4, -SIZE.y * 0.35), this.body.angle));
        //     this.trailFrontLeft ??= new Trail(this.view, 3, 'black');
        //     this.trailFrontLeft.elem.style.setProperty('opacity', '0.25');
        //     this.trailFrontLeft.add(frontLeftTire);
        //     const frontRightTire = Vector.add(this.body.position, Vector.rotate(Vector.create(SIZE.x * 0.4, SIZE.y * 0.35), this.body.angle));
        //     this.trailFrontRight ??= new Trail(this.view, 3, 'black');
        //     this.trailFrontRight.elem.style.setProperty('opacity', '0.25');
        //     this.trailFrontRight.add(frontRightTire);
        // } else {
        //     this.trailFrontLeft = this.trailFrontRight = undefined;
        // }
    }

    private _checkCheckpoint() {
        if (this._place) {
            return;
        }
        const sensor = this.race.getCheckpointSensor(this._nextCheckpoint);
        if (Collision.collides(this.body, sensor)) {
            if (this._nextCheckpoint === 0) {
                this._lap ++;
                if (this._lap > this.race.laps) {
                    this._place = this.race.claimPlace();
                }
            }
            this._nextCheckpoint = (this._nextCheckpoint + 1) % this.race.track.checkpoints.length;
        }
    }

}