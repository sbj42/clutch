import { Direction, Size, Offset, directionOpposite, SizeLike, OffsetLike }  from 'tiled-geometry';
import { TrackTile } from './track-tile';
import { Checkpoint } from './checkpoint';
import { NARROW_TRACK_WIDTH, STANDARD_TRACK_WIDTH } from '../constants';
import { Pathfinder } from './pathfinder';

export type TrackWidth = 'standard' | 'narrow';

export type AddOptions = {
    trackWidth?: TrackWidth;
    checkpoint?: boolean;
}

type TileArray = Array<TrackTile | undefined>;

const TEMP_OFFSET = new Offset();

function _getTrackWidth(trackWidth: TrackWidth) {
    switch (trackWidth) {
        case 'narrow': return NARROW_TRACK_WIDTH;
        default: return STANDARD_TRACK_WIDTH;
    }
}

export class Track {
    private _size = new Size();
    private _tiles: TileArray = [];
    private _checkpoints: Checkpoint[] = [];
    private _pathfinders?: Pathfinder[];

    get size(): SizeLike {
        return this._size;
    }

    get checkpoints(): readonly Checkpoint[] {
        return this._checkpoints;
    }

    getTile(x: number, y: number) {
        if (!this._size.contains(x, y)) {
            throw new Error('invalid getTile');
        }
        return this._tiles[this._size.index(x, y)];
    }

    add(x: number, y: number, directions: Direction | Direction[], options?: AddOptions): OffsetLike {
        const trackWidth = _getTrackWidth(options?.trackWidth ?? 'standard');
        const checkpoint = options?.checkpoint ?? false;
        if (!(directions instanceof Array)) {
            directions = [directions];
        }
        for (const direction of directions) {
            const tile1 = this._getOrCreateTile(x, y);
            tile1.setExit(direction, { trackWidth });
            const otherOffset = TEMP_OFFSET.set(x, y).addDirection(direction);
            const tile2 = this._getOrCreateTile(otherOffset.x, otherOffset.y);
            tile2.setExit(directionOpposite(direction), { trackWidth });
            if (checkpoint) {
                this.addCheckpoint(otherOffset.x, otherOffset.y, directionOpposite(direction));
            }
            x = otherOffset.x;
            y = otherOffset.y;
        }
        this._pathfinders = undefined;
        return { x, y };
    }

    addCheckpoint(x: number, y: number, direction: Direction) {
        const tile = this.getTile(x, y);
        if (!tile) {
            throw new Error('invalid addCheckpoint');
        }
        const checkpoint = new Checkpoint(this._checkpoints.length, tile, direction);
        this._checkpoints.push(checkpoint);
        tile.checkpoint = checkpoint;
        this._pathfinders = undefined;
    }

    getPathfinder(checkpointIndex: number) {
        if (this._pathfinders === undefined) {
            this._pathfinders = [];
            for (const checkpoint of this._checkpoints) {
                const offset = checkpoint.tile.offset;
                this._pathfinders.push(new Pathfinder(this, offset.x, offset.y));
            }
        }
        return this._pathfinders[checkpointIndex];
    }

    //#region Internal

    private _setSize(width: number, height: number) {
        const oldTiles = this._tiles;
        const oldSize = this._size;
        const newSize = new Size(width, height);
        if (newSize.width < oldSize.width || newSize.height < oldSize.height) {
            throw new Error('invalid setSize');
        }
        this._size = newSize;
        this._tiles = new Array(this._size.area);
        for (const offset of oldSize.offsets()) {
            this._setTile(offset.x, offset.y, oldTiles[oldSize.index(offset.x, offset.y)]);
        }
    }

    private _expandToInclude(x: number, y: number) {
        if (!this._size.contains(x, y)) {
            this._setSize(Math.max(this._size.width, x + 1), Math.max(this._size.height, y + 1));
        }
    }

    private _getOrCreateTile(x: number, y: number): TrackTile {
        this._expandToInclude(x, y);
        let tile = this.getTile(x, y);
        if (!tile) {
            this._setTile(x, y, tile = new TrackTile(this, x, y));
        }
        return tile;
    }

    private _setTile(x: number, y: number, tile: TrackTile | undefined) {
        if (!this._size.contains(x, y)) {
            throw new Error('invalid setTile');
        }
        this._tiles[this._size.index(x, y)] = tile;
    }

    //#endregion
}