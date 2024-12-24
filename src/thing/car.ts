import { fixAngle, fixTurn } from "../geom/angle";
import { Point } from "../geom/point";
import { ImageSet } from '../view/image-set';
import type { View } from "../view/view";
import { Thing } from './thing';
import { Trail } from "./trail";

const SIZE = new Point(32, 64);

const CARS_IMAGESOURCE = new URL(
    '../../image/cars.png?as=webp',
    import.meta.url
);
const IMAGESET = new ImageSet(CARS_IMAGESOURCE, SIZE, 6);

const TURN_SPEED = 360;
const ACCELERATION = 400;
const MAX_SPEED = 500;
const TRAIL_SPEED_DIFF = 0.4;
const TRAIL_ANGLE_DIFF = 60;
const TRAIL_ANGLE_SPEED = 0.4;

export class Car extends Thing {
    speed = Point.ORIGIN;

    private _desiredAngle: number | undefined;
    private _desiredSpeed: number | undefined;

    trailFrontLeft?: Trail;
    trailFrontRight?: Trail;
    trailBackLeft?: Trail;
    trailBackRight?: Trail;

    constructor(view: View, location: Point, index: number) {
        super(view, IMAGESET.getImage(index).makeElement(), SIZE.multiply(0.5), location);
        this.elem.classList.add('car');
        view.addThing(this);
    }

    go(direction?: Point) {
        if (direction) {
            const mag = direction.magnitude();
            if (mag > 0.01) {
                this._desiredAngle = direction.angle();
            } else {
                this._desiredAngle = undefined;
            }
            this._desiredSpeed = mag;
        } else {
            this._desiredSpeed = undefined;
            this._desiredAngle = undefined;
        }
    }

    tick(sec: number) {
        let targetAngle = this._desiredAngle;
        let trails = 0;
        if (targetAngle !== undefined) {
            const angleDiff = fixTurn(targetAngle - this.angle);
            if (targetAngle > this.angle + 180) {
                targetAngle -= 360;
            } else if (targetAngle < this.angle - 180) {
                targetAngle += 360;
            }
            const turnSpeed = TURN_SPEED * sec;
            if (Math.abs(angleDiff) < turnSpeed) {
                this.angle = targetAngle;
            } else {
                this.angle = fixAngle(this.angle + Math.sign(targetAngle - this.angle) * turnSpeed);
            }
        }
        let { _desiredSpeed: desiredSpeed } = this;
        if (desiredSpeed !== undefined) {
            const speedDiff = desiredSpeed - this.speed.magnitude() / MAX_SPEED;
            if (speedDiff > TRAIL_SPEED_DIFF) {
                trails = 2;
            }
            const targetSpeed = new Point(0, -1).rotate(this.angle).multiply(MAX_SPEED * desiredSpeed);
            const toward = targetSpeed.subtract(this.speed);;
            const mag = toward.magnitude();
            const acceleration = ACCELERATION * sec;
            if (mag < acceleration) {
                this.speed = targetSpeed;
            } else {
                this.speed = this.speed.add(toward.multiply(acceleration / mag));
            }
        }
        if (this.speed.x !== 0 || this.speed.y !== 0) {
            this.location = this.location.add(this.speed.multiply(sec));
        }
        const sideways = fixTurn(this.angle - this.speed.angle());
        if (Math.abs(sideways) > TRAIL_ANGLE_DIFF && this.speed.magnitude() > TRAIL_ANGLE_SPEED * MAX_SPEED) {
            trails = 4;
        }
        if (trails >= 2) {
            this.trailBackLeft ??= new Trail(this.view, 3, 'black');
            this.trailBackLeft.elem.style.setProperty('opacity', '0.25');
            this.trailBackLeft.add(this.location.add(new Point(-SIZE.x * 0.4, SIZE.y * 0.35).rotate(this.angle)));
            this.trailBackRight ??= new Trail(this.view, 3, 'black');
            this.trailBackRight.elem.style.setProperty('opacity', '0.25');
            this.trailBackRight.add(this.location.add(new Point(SIZE.x * 0.4, SIZE.y * 0.35).rotate(this.angle)));
        } else {
            this.trailBackLeft = this.trailBackRight = undefined;
        }
        if (trails >= 4) {
            this.trailFrontLeft ??= new Trail(this.view, 3, 'black');
            this.trailFrontLeft.elem.style.setProperty('opacity', '0.25');
            this.trailFrontLeft.add(this.location.add(new Point(-SIZE.x * 0.4, -SIZE.y * 0.35).rotate(this.angle)));
            this.trailFrontRight ??= new Trail(this.view, 3, 'black');
            this.trailFrontRight.elem.style.setProperty('opacity', '0.25');
            this.trailFrontRight.add(this.location.add(new Point(SIZE.x * 0.4, -SIZE.y * 0.35).rotate(this.angle)));
        } else {
            this.trailFrontLeft = this.trailFrontRight = undefined;
        }
    }

}