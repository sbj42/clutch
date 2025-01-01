import { Size, SizeLike }  from 'tiled-geometry';
import { Tile } from './tile';
import { Checkpoint } from './checkpoint';
import { Pathfinder } from './pathfinder';
import { offsetFromString } from '../geom/offset-str';
import { ObstacleInfo } from './obstacle';
import type { DecorationInfo } from './decoration';
import { copyTrackInfo, type TrackInfo } from './track-info';

type TileArray = Array<Tile | undefined>;

export class Track {
    private readonly _info: TrackInfo;
    private readonly _size = new Size();
    private readonly _tiles: TileArray = [];
    private readonly _start: Checkpoint;
    private readonly _checkpoints: Checkpoint[] = [];
    private readonly _pathfinders: Pathfinder[] = [];
    private readonly _obstacles: Readonly<ObstacleInfo>[] = [];
    private readonly _decorations: Readonly<DecorationInfo>[] = [];

    constructor(info: TrackInfo) {
        this._info = info;
        for (const offsetStr in info.tiles) {
            const offset = offsetFromString(offsetStr);
            this._size.set(Math.max(this._size.width, offset.x + 1), Math.max(this._size.height, offset.y + 1));
        }
        for (const offsetStr in info.tiles) {
            const offset = offsetFromString(offsetStr);
            const other = info.tiles[offsetStr];
            if (!other) {
                throw new Error('missing tile ' + offsetStr);
            }
            const tile = new Tile(offset, other);
            this._tiles[this._size.index(offset.x, offset.y)] = tile;
            if (tile.checkpoint) {
                this._checkpoints[tile.checkpoint.index] = tile.checkpoint;
            }
        }
        const startOffset = offsetFromString(info.startOffset);
        const startTile = this.getTile(startOffset.x, startOffset.y);
        if (!startTile) {
            throw new Error('invalid start');
        }
        this._start = new Checkpoint(startTile, info.start);
        for (const checkpoint of this._checkpoints) {
            const offset = checkpoint.tile.offset;
            this._pathfinders.push(new Pathfinder(this, offset.x, offset.y));
        }
        this._obstacles = info.obstacles ?? [];
        this._decorations = info.decorations ?? [];
    }

    get name() {
        return this._info.name;
    }

    get material() {
        return this._info.material;
    }

    get size(): SizeLike {
        return this._size;
    }

    get start() {
        return this._start;
    }

    get checkpoints(): readonly Checkpoint[] {
        return this._checkpoints;
    }

    get pathfinders(): readonly Pathfinder[] {
        return this._pathfinders;
    }

    get obstacles(): readonly ObstacleInfo[] {
        return this._obstacles;
    }

    get decorations(): readonly DecorationInfo[] {
        return this._decorations;
    }

    getInfo() {
        return copyTrackInfo(this._info);
    }

    getTile(x: number, y: number) {
        if (!this._size.contains(x, y)) {
            throw new Error('invalid getTile');
        }
        return this._tiles[this._size.index(x, y)];
    }

}