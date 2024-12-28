import { Direction } from "tiled-geometry";
import { TrackTile } from "./track-tile";

export class Checkpoint {
    readonly index: number;
    readonly tile: TrackTile;
    readonly direction: Direction;

    constructor(index: number, tile: TrackTile, direction: Direction) {
        this.index = index;
        this.tile = tile;
        this.direction = direction;
    }

    get isFirst() {
        return this.index === 0;
    }
}
