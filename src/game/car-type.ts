import { Size } from "tiled-geometry";

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
