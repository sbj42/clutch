import { ImageSet } from "./image-set";
import { Car } from "../race/car";
import { CarType } from "../race/car-type";
import { Size } from "tiled-geometry";
import { Vector } from "matter-js";
import { CloudUi } from "./cloud-ui";
import type { RaceUi } from "./race-ui";
import { MarkUi } from "./mark-ui";
import { CarAudio } from "./car-audio";
import { rotateInPlace } from "../geom/vector";

const STANDARD_SIZE = new Size().set(64, 32);
const STANDARD_IMAGESOURCE = new URL(
    '../../image/cars.png?as=webp',
    import.meta.url
);
const STANDARD_IMAGESET = new ImageSet(STANDARD_IMAGESOURCE, STANDARD_SIZE, 6);

export function getCarSize(type: CarType) {
    return STANDARD_SIZE;
}

function getCarImageSet(type: CarType) {
    return STANDARD_IMAGESET;
}

function getCarColor(type: CarType) {
    return ['yellow', 'red', 'skyblue', 'green', 'pink', 'purple'][type.imageIndex];
}

const EXHAUST_TICK = 0.035;
const EXHAUST_CHANCE_IDLE = 0.015;
const EXHAUST_CHANCE_NORMAL = 0.2;
const EXHAUST_CHANCE_BURNOUT = 1;
const EXHAUST_CHANCE_DRIFT = 1;
const EXHAUST_VELOCITY = 20;
const EXHAUST_DURATION = 2;
const EXHAUST_COLOR = 'rgba(200, 200, 200, 0.08)';

const VEC_POSITION = Vector.create();
const VEC_VELOCITY = Vector.create();

export class CarUi {
    readonly raceUi: RaceUi;
    readonly car: Car;
    readonly audio: CarAudio;
    readonly element: HTMLElement;
    readonly miniElement: HTMLElement;

    private readonly _miniScale: number;

    private _exhaustTime = EXHAUST_TICK;

    private _skidBackLeft?: MarkUi;
    private _skidBackRight?: MarkUi;
    private _skidFrontLeft?: MarkUi;
    private _skidFrontRight?: MarkUi;

    constructor(raceUi: RaceUi, car: Car, miniScale: number) {
        this.raceUi = raceUi;
        this.car = car;
        this._miniScale = miniScale;
        this.audio = new CarAudio(raceUi, car);
        this.element = getCarImageSet(car.type).get(car.type.imageIndex);
        const carSize = getCarSize(this.car.type);
        this.element.style.setProperty('position', 'absolute');
        this.element.style.setProperty('transform-origin', `${carSize.width / 2}px ${carSize.height / 2}px`);
        this.miniElement = document.createElement('div');
        this.miniElement.style.setProperty('position', 'absolute');
        this.miniElement.style.setProperty('background-color', getCarColor(car.type));
        this.miniElement.style.setProperty('width', '3px');
        this.miniElement.style.setProperty('height', '3px');
    }

    tick(sec: number) {
        this.audio.tick(sec);
        const body = this.car.body;
        const size = getCarSize(this.car.type);
        if (this.raceUi.gameOptions.exhaust) {
            this._exhaustTime -= sec;
            if (this._exhaustTime < 0) {
                this._exhaustTime = EXHAUST_TICK;
                const exhaustChance = this.car.idle ? EXHAUST_CHANCE_IDLE
                    : this.car.drift ? EXHAUST_CHANCE_DRIFT
                    : this.car.burnout ? EXHAUST_CHANCE_BURNOUT
                    : EXHAUST_CHANCE_NORMAL;
                if (Math.random() <= exhaustChance) {
                    VEC_POSITION.x = -size.width * 0.4;
                    VEC_POSITION.y = 0;
                    rotateInPlace(VEC_POSITION, body.angle);
                    const x = VEC_POSITION.x + body.position.x;
                    const y = VEC_POSITION.y + body.position.y;
                    VEC_VELOCITY.x = EXHAUST_VELOCITY * (-1.3 + 0.6 * Math.random());
                    VEC_VELOCITY.y = 0;
                    rotateInPlace(VEC_VELOCITY, body.angle);
                    const dx = VEC_VELOCITY.x + body.velocity.x * 15;
                    const dy = VEC_VELOCITY.y + body.velocity.y * 15;
                    const exhaust = new CloudUi(x, y, dx, dy, EXHAUST_COLOR, EXHAUST_DURATION);
                    this.raceUi.addCloud(exhaust);
                }
            }
        }
        if (this.raceUi.gameOptions.skidMarks) {
            if (this.car.burnout || this.car.drift) {
                // back-left tire
                {
                    VEC_POSITION.x = -size.width * 0.4;
                    VEC_POSITION.y = -size.height * 0.35;
                    rotateInPlace(VEC_POSITION, body.angle);
                    const x = body.position.x + VEC_POSITION.x;
                    const y = body.position.y + VEC_POSITION.y;
                    this._skidBackLeft = this._getOrCreateMark(this._skidBackLeft, 'rgba(0, 0, 0, 0.25)', 3);
                    this._skidBackLeft.add(x, y);
                }
                // back-right tire
                {
                    VEC_POSITION.x = -size.width * 0.4;
                    VEC_POSITION.y = size.height * 0.35;
                    rotateInPlace(VEC_POSITION, body.angle);
                    const x = body.position.x + VEC_POSITION.x;
                    const y = body.position.y + VEC_POSITION.y;
                    this._skidBackRight = this._getOrCreateMark(this._skidBackRight, 'rgba(0, 0, 0, 0.25)', 3);
                    this._skidBackRight.add(x, y);
                }
            } else {
                this._skidBackLeft = this._skidBackRight = undefined;
            }
            if (this.car.drift) {
                // front-left tire
                {
                    VEC_POSITION.x = size.width * 0.4;
                    VEC_POSITION.y = -size.height * 0.35;
                    rotateInPlace(VEC_POSITION, body.angle);
                    const x = body.position.x + VEC_POSITION.x;
                    const y = body.position.y + VEC_POSITION.y;
                    this._skidFrontLeft = this._getOrCreateMark(this._skidFrontLeft, 'rgba(0, 0, 0, 0.25)', 3);
                    this._skidFrontLeft.add(x, y);
                }
                // front-right tire
                {
                    VEC_POSITION.x = size.width * 0.4;
                    VEC_POSITION.y = size.height * 0.35;
                    rotateInPlace(VEC_POSITION, body.angle);
                    const x = body.position.x + VEC_POSITION.x;
                    const y = body.position.y + VEC_POSITION.y;
                    this._skidFrontRight = this._getOrCreateMark(this._skidFrontRight, 'rgba(0, 0, 0, 0.25)', 3);
                    this._skidFrontRight.add(x, y);
                }
            } else {
                this._skidFrontLeft = this._skidFrontRight = undefined;
            }
        }
    }

    update() {
        const body = this.car.body;
        const size = getCarSize(this.car.type);
        this.element.style.setProperty('top', `${body.position.y - size.height / 2}px`);
        this.element.style.setProperty('left', `${body.position.x - size.width / 2}px`);
        this.element.style.setProperty('transform', `rotate(${body.angle}rad)`);
        this.miniElement.style.setProperty('top', `${body.position.y * this._miniScale - 1}px`);
        this.miniElement.style.setProperty('left', `${body.position.x * this._miniScale - 1}px`);
    }

    private _getOrCreateMark(mark: MarkUi | undefined, stroke: string, strokeWidth: number): MarkUi {
        if (mark) {
            return mark;
        } else {
            mark = new MarkUi(stroke, strokeWidth);
            this.raceUi.addMark(mark);
            return mark;
        }
    }
}
