import { Vector } from "matter-js";
import type { RaceUi } from "./race-ui";
import { getObstacleCollisionSize, Obstacle, ObstacleType } from "../race/obstacle";
import { Image } from "./image";
import { Size } from "tiled-geometry";

const CONE_IMAGE = new URL(
    '../../image/cone.png?as=webp',
    import.meta.url
);
const CONE_STRUCK_IMAGE = new URL(
    '../../image/cone-struck.png?as=webp',
    import.meta.url
);

const CONE_SIZE = new Size(14, 14);
const CONE_STRUCK_SIZE = new Size(14, 12);

export function getObstacleSize(type: ObstacleType, struck: boolean) {
    switch (type) {
        case 'cone': return struck ? CONE_STRUCK_SIZE : CONE_SIZE;
    }
}

function getObstacleImage(type: ObstacleType, struck: boolean) {
    const url = struck ? CONE_STRUCK_IMAGE : CONE_IMAGE;
    const size = getObstacleSize(type, struck);
    return new Image(url, size, Vector.create(0, 0));
}

export class ObstacleUi {
    readonly raceUi: RaceUi;
    readonly obstacle: Obstacle;
    readonly element: HTMLElement;

    private _wasStruck = false;

    constructor(raceUi: RaceUi, obstacle: Obstacle) {
        this.raceUi = raceUi;
        this.obstacle = obstacle;
        this.element = document.createElement('div');
        this.element.style.setProperty('position', 'absolute');
        const size = getObstacleSize(this.obstacle.type, this.obstacle.struck);
        this.element.style.setProperty('transform-origin', `${size.width / 2}px ${size.height / 2}px`);
        this.element.appendChild(getObstacleImage(this.obstacle.type, false).makeElement());
    }

    tick(sec: number) {
    }

    update() {
        const body = this.obstacle.body;
        const size = getObstacleSize(this.obstacle.type, this.obstacle.struck);
        this.element.style.setProperty('top', `${body.position.y - size.height / 2}px`);
        this.element.style.setProperty('left', `${body.position.x - size.width / 2}px`);
        this.element.style.setProperty('transform', `rotate(${body.angle}rad)`);
        if (this.obstacle.struck && !this._wasStruck) {
            this._wasStruck = true;
            this.element.innerHTML = '';
            this.element.appendChild(getObstacleImage(this.obstacle.type, true).makeElement());
        }
    }
}
