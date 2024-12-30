import { Size } from "tiled-geometry";
import { Difficulty } from "./race";

export type CarType = {
    typeName: 'standard';
    imageIndex: number;
    acceleration: number;
    maxSpeed: number;
    turnSpeed: number;
    friction: number;
};

export function getPlayerCarType(imageIndex: number, difficulty: Difficulty): CarType {
    return {
        typeName: 'standard',
        imageIndex,
        acceleration: 0.10,
        maxSpeed: 20,
        turnSpeed: difficulty === 'easy' ? 2 * Math.PI : Math.PI,
        friction: 0.01,
    };
}

export function getAiCarType(imageIndex: number, difficulty: Difficulty, adjust: number): CarType {
    let acceleration = 0.19;
    let maxSpeed = 20;
    let friction = 0.01;
    if (difficulty === 'easy') {
        acceleration = 0.18;
        maxSpeed = 18;
    } else if (difficulty === 'hard') {
        acceleration = 0.22;
        maxSpeed = 23;
        friction = 0.017; // a little extra friction to keep the dumb ai from hitting the corners
    }
    return {
        typeName: 'standard',
        imageIndex,
        acceleration: acceleration * adjust,
        maxSpeed: maxSpeed * adjust,
        turnSpeed: 2 * Math.PI,
        friction,
    };
}

const STANDARD_COLLISION_SIZE = new Size().set(64, 32);

export function getCarCollisionSize(type: CarType) {
    return STANDARD_COLLISION_SIZE;
}
