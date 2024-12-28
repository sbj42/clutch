import { Bodies, Body, Collision, Vector } from "matter-js";
import { fixAngle, fixTurn } from "../geom/angle";
import { ImageSet } from '../ui/image-set';
import { ACCELERATION, MAX_SPEED, DRIFT_ANGLE_DIFF, DRIFT_SPEED, BURNOUT_SPEED_DIFF, TURN_SPEED } from "../constants";
import { Size, SizeLike } from "tiled-geometry";
import { Race } from "./race";

export type CarType = {
    readonly typeName: 'standard';
    readonly imageIndex: number;
};

export function getStandardCarType(imageIndex: number): CarType {
    return {
        typeName: 'standard',
        imageIndex,
    };
}

const STANDARD_COLLISION_SIZE = new Size().set(64, 32);

export function getCarCollisionSize(type: CarType) {
    return STANDARD_COLLISION_SIZE;
}
