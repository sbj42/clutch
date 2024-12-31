import { directionOpposite, directionToString, Offset, type Direction } from "tiled-geometry";
import { Track, TrackInfo, type Material } from "./track";
import { ObstacleInfo } from './obstacle';
import { CheckpointInfo } from "./checkpoint";
import { TileInfo } from "./tile";
import { TrackWidth } from "./tile-exit";
import type { DecorationInfo } from "./decoration";

export type TrackBuilderOptions = {
    material?: Material;
}

export class TrackBuilder {
    private readonly _name: string;
    private readonly _material: Material;
    private readonly _tiles: Record<string, TileInfo> = {};
    private readonly _startOffset = new Offset();
    private readonly _startInfo: CheckpointInfo;
    private readonly _obstacles: ObstacleInfo[] = [];
    private readonly _decorations: DecorationInfo[] = [];

    private _offset = new Offset();
    private _trackWidth: TrackWidth = 'standard';
    private _lastDirection?: Direction;
    private _nextCheckpointIndex = 0;

    private constructor(name: string, x: number, y: number, startDirection: Direction, options?: TrackBuilderOptions) {
        this._name = name;
        this._material = options?.material ?? 'road';
        this.moveTo(x, y);
        this.go(startDirection);
        this._startOffset.copyFrom(this._offset);
        this._startInfo = {
            index: -1,
            direction: directionToString(directionOpposite(startDirection)),
        };
    }

    static start(name: string, x: number, y: number, startDirection: Direction, options?: TrackBuilderOptions): TrackBuilder {
        return new TrackBuilder(name, x, y, startDirection, options);
    }

    moveTo(x: number, y: number): this {
        this._offset.set(x, y);
        this._lastDirection = undefined;
        return this;
    }

    trackWidth(width: TrackWidth): this {
        this._trackWidth = width;
        return this;
    }

    checkpoint(): this {
        if (this._lastDirection === undefined) {
            throw new Error('no direction');
        }
        const tile = this._getTile(this._offset);
        if (!tile) {
            throw new Error('no tile');
        }
        tile.checkpoint = {
            index: this._nextCheckpointIndex++,
            direction: directionToString(directionOpposite(this._lastDirection)),
        };
        return this;
    }

    go(...directions: Direction[]): this {
        const trackWidth = this._trackWidth;
        for (const direction of directions) {
            const tile1 = this._getOrCreateTile(this._offset);
            tile1.exits[directionToString(direction)] = { trackWidth };
            this._offset.addDirection(direction);
            const tile2 = this._getOrCreateTile(this._offset);
            tile2.exits[directionToString(directionOpposite(direction))] = { trackWidth };
            this._lastDirection = direction;
        }
        return this;
    }

    obstacle(type: string, x: number, y: number, angle: number): this {
        x += this._offset.x;
        y += this._offset.y;
        this._obstacles.push({
            type,
            location: { x, y },
            angle,
        });
        return this;
    }

    decoration(type: string, x: number, y: number, angle: number): this {
        x += this._offset.x;
        y += this._offset.y;
        this._decorations.push({
            type,
            location: { x, y },
            angle,
        });
        return this;
    }

    toTrackInfo(): TrackInfo {
        const ret: TrackInfo = {
            name: this._name,
            material: this._material,
            startOffset: this._startOffset.toString(),
            start: this._startInfo,
            tiles: this._tiles,
        };
        if (this._obstacles.length > 0) {
            ret.obstacles = this._obstacles;
        }
        if (this._decorations.length > 0) {
            ret.decorations = this._decorations;
        }
        return ret;
    }

    toTrack(): Track {
        return new Track(this.toTrackInfo());
    }
    
    //#region Internal

    private _getTile(offset: Offset) {
        return this._tiles[offset.toString()];
    }

    private _getOrCreateTile(offset: Offset) {
        const offsetStr = offset.toString();
        let tile = this._tiles[offsetStr];
        if (!tile) {
            tile = {
                exits: {},
            };
            this._tiles[offsetStr] = tile;
        }
        return tile;
    }

    //#endregion

}