import { Bodies, Body, Vector } from "matter-js";
import { fixAngle, fixTurn } from "../geom/angle";
import { ImageSet } from '../view/image-set';
import type { View } from "../view/view";
import { Thing } from './thing';
import { Trail } from "./trail";

const SIZE = Vector.create(64, 32);

const CARS_IMAGESOURCE = new URL(
    '../../image/cars.png?as=webp',
    import.meta.url
);
const IMAGESET = new ImageSet(CARS_IMAGESOURCE, SIZE, 6);

const TURN_SPEED = 2 * Math.PI;
const ACCELERATION = 0.15;
const MAX_SPEED = 15;
const TRAIL_SPEED_DIFF = 0.4;
const TRAIL_ANGLE_DIFF = Math.PI / 3;
const TRAIL_ANGLE_SPEED = 0.4;

export class Car extends Thing {
    private _desiredAngle: number | undefined;
    private _desiredSpeed: number | undefined;

    trailFrontLeft?: Trail;
    trailFrontRight?: Trail;
    trailBackLeft?: Trail;
    trailBackRight?: Trail;

    private constructor(view: View, body: Body, index: number) {
        super(view, body, IMAGESET.getImage(index).makeElement(), Vector.mult(SIZE, 0.5));
        this.elem.classList.add('car');
        view.addThing(this);
    }

    static create(view: View, index: number, position: Vector) {
        const body = Bodies.rectangle(position.x - SIZE.x / 2, position.y - SIZE.y / 2, SIZE.x, SIZE.y);
        return new Car(view, body, index);
    }

    go(direction: Vector) {
        const mag = Vector.magnitude(direction);
        if (mag > 0.01) {
            this._desiredAngle = Vector.angle(Vector.create(0, 0), direction);
        } else {
            this._desiredAngle = undefined;
        }
        this._desiredSpeed = mag;
    }

    tick(sec: number) {
        let targetAngle = this._desiredAngle;
        let trails = 0;
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
        let { _desiredSpeed: desiredSpeed } = this;
        if (desiredSpeed !== undefined) {
            const speedDiff = desiredSpeed - this.body.speed / MAX_SPEED;
            if (speedDiff > TRAIL_SPEED_DIFF) {
                trails = 2;
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
        if (Math.abs(sideways) > TRAIL_ANGLE_DIFF && this.body.speed > TRAIL_ANGLE_SPEED * MAX_SPEED) {
            trails = 4;
        }
        if (trails >= 2) {
            this.trailBackLeft ??= new Trail(this.view, 3, 'black');
            this.trailBackLeft.elem.style.setProperty('opacity', '0.25');
            this.trailBackLeft.add(Vector.add(this.body.position, Vector.rotate(Vector.create(-SIZE.x * 0.4, -SIZE.y * 0.35), this.body.angle)));
            this.trailBackRight ??= new Trail(this.view, 3, 'black');
            this.trailBackRight.elem.style.setProperty('opacity', '0.25');
            this.trailBackRight.add(Vector.add(this.body.position, Vector.rotate(Vector.create(-SIZE.x * 0.4, SIZE.y * 0.35), this.body.angle)));
        } else {
            this.trailBackLeft = this.trailBackRight = undefined;
        }
        if (trails >= 4) {
            this.trailFrontLeft ??= new Trail(this.view, 3, 'black');
            this.trailFrontLeft.elem.style.setProperty('opacity', '0.25');
            this.trailFrontLeft.add(Vector.add(this.body.position, Vector.rotate(Vector.create(SIZE.x * 0.4, -SIZE.y * 0.35), this.body.angle)));
            this.trailFrontRight ??= new Trail(this.view, 3, 'black');
            this.trailFrontRight.elem.style.setProperty('opacity', '0.25');
            this.trailFrontRight.add(Vector.add(this.body.position, Vector.rotate(Vector.create(SIZE.x * 0.4, SIZE.y * 0.35), this.body.angle)));
        } else {
            this.trailFrontLeft = this.trailFrontRight = undefined;
        }
    }

}