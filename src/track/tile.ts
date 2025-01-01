import { Direction, Offset, OffsetLike } from 'tiled-geometry';
import { Checkpoint, CheckpointInfo } from './checkpoint';
import { TileExit, TileExitInfo } from './tile-exit';
import { directionFromString } from '../geom/direction-str';

export type TileInfo = {
    checkpoint?: CheckpointInfo;
    exits: Record<string, TileExitInfo | undefined>;
};

export const TILE_SIZE = 600;

export class Tile {
    private _offset = new Offset();
    checkpoint?: Checkpoint;

    private _exits: Array<TileExit | undefined> = [];

    constructor(offset: OffsetLike, info: TileInfo) {
        this._offset.copyFrom(offset);
        if (info.checkpoint) {
            this.checkpoint = new Checkpoint(this, info.checkpoint);
        }
        for (const directionStr in info.exits) {
            const direction = directionFromString(directionStr);
            const exitInfo = info.exits[directionStr];
            if (exitInfo) {
                this._exits[direction] = new TileExit(exitInfo);
            }
        }
    }

    get offset(): OffsetLike {
        return this._offset;
    }

    getExit(direction: Direction) {
        return this._exits[direction];
    }

}
