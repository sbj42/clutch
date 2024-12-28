import { directionOpposite, Offset, type Direction } from "tiled-geometry";
import { Track, type AddOptions, type TrackWidth } from "./track";

export class TrackBuilder {
    private _track = new Track();
    private _offset = new Offset();
    private _addOpt: AddOptions = {};
    private _lastDirection?: Direction;

    constructor(x: number, y: number, fromDirection: Direction) {
        this._lastDirection = directionOpposite(fromDirection);
        this._track.add(x, y, fromDirection);
        this._track.addCheckpoint(x, y, fromDirection);
        this._offset.set(x, y);
    }

    moveTo(x: number, y: number): this {
        this._offset.set(x, y);
        this._lastDirection = undefined;
        return this;
    }

    trackWidth(width: TrackWidth): this {
        this._addOpt.trackWidth = width;
        return this;
    }

    checkpoint(): this {
        if (!this._lastDirection) {
            throw new Error('no track yet');
        }
        this._track.addCheckpoint(this._offset.x, this._offset.y, directionOpposite(this._lastDirection));
        return this;
    }

    go(...direction: Direction[]): this {
        this._offset.copyFrom(this._track.add(this._offset.x, this._offset.y, direction, this._addOpt));
        this._lastDirection = direction.at(-1);
        return this;
    }

    done(): Track {
        return this._track;
    }

}