import { Bodies, Body, Vector } from "matter-js";
import { fixAngle, fixTurn } from "../geom/angle";
import { ImageSet } from '../view/image-set';
import type { View } from "../view/view";
import { Thing } from './thing';
import { Trail } from "./trail";
import { Cloud } from "./cloud";
import { ACCELERATION, COLLISION_INSET, MAX_SPEED, SKID_ANGLE_DIFF, SKID_ANGLE_SPEED, SKID_SPEED_DIFF, TURN_SPEED } from "../constants";

const SIZE = Vector.create(64, 32);

const CARS_IMAGESOURCE = new URL(
    '../../image/cars.png?as=webp',
    import.meta.url
);
const IMAGESET = new ImageSet(CARS_IMAGESOURCE, SIZE, 6);

export class Car extends Thing {
    private _desiredAngle: number | undefined;
    private _desiredSpeed: number | undefined;

    lap = 1;
    place = 0;
    nextCheckpoint = 0;

    trailFrontLeft?: Trail;
    trailFrontRight?: Trail;
    trailBackLeft?: Trail;
    trailBackRight?: Trail;

    private constructor(view: View, body: Body, index: number) {
        super(view, body, IMAGESET.getImage(index).makeElement(), Vector.mult(SIZE, 0.5));
        this._desiredAngle = undefined;
        this._desiredSpeed = 0;
        view.addThing(this);
    }

    static create(view: View, index: number, position: Vector) {
        const body = Bodies.rectangle(position.x, position.y, SIZE.x - COLLISION_INSET * 2, SIZE.y - COLLISION_INSET * 2, {
            friction: 1,
            restitution: 0.8,
        });
        return new Car(view, body, index);
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
        let skids = 0;
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
            if (speedDiff > SKID_SPEED_DIFF) {
                skids = 2;
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
        }
        super.tick(sec);
        const sideways = fixTurn(this.body.angle - Vector.angle(Vector.create(0, 0), this.body.velocity));
        if (Math.abs(sideways) > SKID_ANGLE_DIFF && this.body.speed > SKID_ANGLE_SPEED * MAX_SPEED) {
            skids = 4;
        }
        const backCenter = Vector.add(this.body.position, Vector.rotate(Vector.create(-SIZE.x * 0.4, 0), this.body.angle));
        if (Math.random() < 0.08 + 0.1 * skids) {
            const back = Vector.mult(Vector.rotate(Vector.create(-1, 0), this.body.angle), MAX_SPEED / 5);
            new Cloud(this.view, backCenter, Vector.add(this.body.velocity, back));
        }
        if (skids >= 2) {
            const backLeftTire = Vector.add(this.body.position, Vector.rotate(Vector.create(-SIZE.x * 0.4, -SIZE.y * 0.35), this.body.angle));
            this.trailBackLeft ??= new Trail(this.view, 3, 'black');
            this.trailBackLeft.elem.style.setProperty('opacity', '0.25');
            this.trailBackLeft.add(backLeftTire);
            const backRightTire = Vector.add(this.body.position, Vector.rotate(Vector.create(-SIZE.x * 0.4, SIZE.y * 0.35), this.body.angle));
            this.trailBackRight ??= new Trail(this.view, 3, 'black');
            this.trailBackRight.elem.style.setProperty('opacity', '0.25');
            this.trailBackRight.add(backRightTire);
        } else {
            this.trailBackLeft = this.trailBackRight = undefined;
        }
        if (skids >= 4) {
            const frontLeftTire = Vector.add(this.body.position, Vector.rotate(Vector.create(SIZE.x * 0.4, -SIZE.y * 0.35), this.body.angle));
            this.trailFrontLeft ??= new Trail(this.view, 3, 'black');
            this.trailFrontLeft.elem.style.setProperty('opacity', '0.25');
            this.trailFrontLeft.add(frontLeftTire);
            const frontRightTire = Vector.add(this.body.position, Vector.rotate(Vector.create(SIZE.x * 0.4, SIZE.y * 0.35), this.body.angle));
            this.trailFrontRight ??= new Trail(this.view, 3, 'black');
            this.trailFrontRight.elem.style.setProperty('opacity', '0.25');
            this.trailFrontRight.add(frontRightTire);
        } else {
            this.trailFrontLeft = this.trailFrontRight = undefined;
        }
    }

}