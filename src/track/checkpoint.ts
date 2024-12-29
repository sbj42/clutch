import { Direction } from "tiled-geometry";
import { Tile } from "./tile";

export type StartInfo = {
    direction: Direction;
};

export type CheckpointInfo = {
    index: number; // -1 for start
    direction: Direction;
};

export class Checkpoint {
    readonly tile: Tile;
    readonly index: number; // -1 for start
    readonly direction: Direction;

    constructor(tile: Tile, info: CheckpointInfo | StartInfo) {
        this.tile = tile;
        this.index = 'index' in info ? info.index : -1;
        this.direction = info.direction;
    }

    get isStart() {
        return this.index === -1;
    }
}
