import { directionOpposite, directionToString, Offset, type Direction } from "tiled-geometry";
import { Track, TrackInfo } from "./track";
import { ObstacleInfo } from './obstacle';
import { CheckpointInfo } from "./checkpoint";
import { TileInfo } from "./tile";
import { TrackWidth } from "./tile-exit";

export class TrackBuilder {
    private readonly _tiles: Record<string, TileInfo> = {};
    private readonly _startOffset = new Offset();
    private readonly _startInfo: CheckpointInfo;
    private readonly _obstacles: ObstacleInfo[] = [];

    private _offset = new Offset();
    private _trackWidth: TrackWidth = 'standard';
    private _lastDirection?: Direction;
    private _nextCheckpointIndex = 0;

    private constructor(x: number, y: number, startDirection: Direction) {
        this.moveTo(x, y);
        this.go(startDirection);
        this._startOffset.copyFrom(this._offset);
        this._startInfo = {
            index: -1,
            direction: directionToString(directionOpposite(startDirection)),
        };
    }

    static start(x: number, y: number, startDirection: Direction): TrackBuilder {
        return new TrackBuilder(x, y, startDirection);
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
        if (!this._lastDirection) {
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
        x += this._offset.x
        this._obstacles.push({
            type,
            location: { x, y },
            angle,
        });
        return this;
    }

    toTrackInfo(): TrackInfo {
        return {
            startOffset: this._startOffset.toString(),
            start: this._startInfo,
            tiles: this._tiles,
            obstacles: this._obstacles,
        };
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