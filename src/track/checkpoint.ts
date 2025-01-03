import { Direction } from "tiled-geometry";
import { Tile } from "./tile";
import { directionFromString } from "../geom/direction-str";

export type StartInfo = {
    offset: string;
    direction: string;
};

export type CheckpointInfo = {
    index: number; // -1 for start
    direction: string;
};

export class Checkpoint {
    readonly tile: Tile;
    readonly index: number; // -1 for start
    readonly direction: Direction;

    constructor(tile: Tile, info: CheckpointInfo | StartInfo) {
        this.tile = tile;
        this.index = 'index' in info ? info.index : -1;
        this.direction = directionFromString(info.direction);
    }

    get isStart() {
        return this.index === -1;
    }
}
