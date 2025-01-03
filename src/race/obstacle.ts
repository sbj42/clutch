import { Bodies, Body, Collision, Vector } from "matter-js";
import { Race } from "./race";
import { ObstacleInfo } from "../track/obstacle";
import { TILE_SIZE } from "../track/tile";
import { Size } from "tiled-geometry";

export type ObstacleType = 'cone' | 'barrel' | 'tire';

function _parseObstacleType(str: string): ObstacleType {
    if (str === 'cone' || str === 'barrel') {
        return str;
    }
    throw new Error('invalid obstacle type ' + str);
}

const CONE_COLLISION_SIZE = new Size(14, 14);
const BARREL_COLLISION_SIZE = new Size(23, 23);
const TIRE_COLLISION_SIZE = new Size(30, 30);

export function getObstacleCollisionSize(type: ObstacleType) {
    switch (type) {
        case 'cone': return CONE_COLLISION_SIZE;
        case 'barrel': return BARREL_COLLISION_SIZE;
        case 'tire': return TIRE_COLLISION_SIZE;
        default: throw new Error('invalid obstacle type ' + type);
    }
}

export class Obstacle {
    readonly race: Race;
    readonly body: Body;
    readonly type: ObstacleType;

    private _struck = false;

    constructor(race: Race, info: ObstacleInfo) {
        this.race = race;
        this.type = _parseObstacleType(info.type);
        const size = getObstacleCollisionSize(this.type);
        this.body = Bodies.rectangle(info.location.x * TILE_SIZE, info.location.y * TILE_SIZE, size.width, size.height, {
            label: this.type,
            angle: info.angle,
            frictionAir: 0.03,
            restitution: 0.8,
            density: 0.004,
        });
    }

    get struck() {
        return this._struck;
    }

    tick(sec: number) {
        if (this.body.speed > 1) {
            this._struck = true;
        }
    }

}