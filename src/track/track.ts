import { Size, SizeLike }  from 'tiled-geometry';
import { Tile, TileInfo } from './tile';
import { Checkpoint, CheckpointInfo } from './checkpoint';
import { Pathfinder } from './pathfinder';
import { offsetFromString } from '../geom/offset-str';
import { ObstacleInfo } from './obstacle';
import type { DecorationInfo } from './decoration';

export type Material = 'dirt' | 'road';

type TileArray = Array<Tile | undefined>;

export type TrackInfo = {
    name: string;
    material: Material;
    startOffset: string;
    start: CheckpointInfo;
    tiles: Record<string, TileInfo>;
    obstacles?: ObstacleInfo[];
    decorations?: DecorationInfo[];
}

export class Track {
    readonly name: string;
    readonly material: Material;
    private _size = new Size();
    private _tiles: TileArray = [];
    private _start: Checkpoint;
    private _checkpoints: Checkpoint[] = [];
    private _pathfinders: Pathfinder[] = [];
    private _obstacles: Readonly<ObstacleInfo>[] = [];
    private _decorations: Readonly<DecorationInfo>[] = [];

    constructor(info: TrackInfo) {
        this.name = info.name;
        this.material = info.material;
        for (const offsetStr in info.tiles) {
            const offset = offsetFromString(offsetStr);
            this._size.set(Math.max(this._size.width, offset.x + 1), Math.max(this._size.height, offset.y + 1));
        }
        for (const offsetStr in info.tiles) {
            const offset = offsetFromString(offsetStr);
            const tile = new Tile(offset, info.tiles[offsetStr]);
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

    getTile(x: number, y: number) {
        if (!this._size.contains(x, y)) {
            throw new Error('invalid getTile');
        }
        return this._tiles[this._size.index(x, y)];
    }

}