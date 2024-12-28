import { Direction, OffsetLike } from 'tiled-geometry';
import { Track } from './track';
import { Checkpoint } from './checkpoint';

export type TileExit = {
    readonly trackWidth: number;
}

export class TrackTile {
    readonly offset: OffsetLike;
    checkpoint?: Checkpoint; 

    private readonly _track: Track;


    private _exits: Map<Direction, TileExit | undefined> = new Map();

    constructor(track: Track, x: number, y: number) {
        this.offset = { x, y };
        this._track = track;
    }

    getExit(direction: Direction) {
        return this._exits.get(direction);
    }

    setExit(direction: Direction, exit: TileExit | undefined) {
        this._exits.set(direction, exit);
    }

}
