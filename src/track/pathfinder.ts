import { directionIsCardinal, DIRECTIONS, Offset, Size, type Direction, type OffsetLike, type SizeLike } from "tiled-geometry";
import type { Track } from "./track";

const OFFSET = new Offset();
const SQRT2 = Math.sqrt(2);

function _dirCost(dir: Direction) {
    return directionIsCardinal(dir) ? 1 : SQRT2;
}

export class Pathfinder {
    private readonly _track: Track;
    private readonly _size: Size;
    private readonly _grid: number[];

    constructor(track: Track, x: number, y: number) {
        this._track = track;
        this._size = new Size().copyFrom(track.size);
        this._grid = new Array(this._size.area);

        const target = new Offset(x, y);
        this._set(target, 0);

        const todo = [target];
        let at = 0;
        while (at < todo.length) {
            const cur = todo[at ++];
            const curValue = this._get(cur);
            const curTile = track.getTile(cur.x, cur.y);
            if (!curTile) {
                continue;
            }
            for (const dir of DIRECTIONS) {
                if (!curTile.getExit(dir)) {
                    continue;
                }
                OFFSET.copyFrom(cur).addDirection(dir);
                if (!this._size.contains(OFFSET.x, OFFSET.y)) {
                    continue;
                }
                if (this._get(OFFSET) !== undefined) {
                    continue;
                }
                this._set(OFFSET, curValue + _dirCost(dir));
                todo.push(new Offset(OFFSET.x, OFFSET.y));
            }
        }
    }

    getNextStep(fromX: number, fromY: number): Direction[] {
        const ret: Direction[] = [];
        let dist = Infinity;
        const curTile = this._track.getTile(fromX, fromY);
        if (!curTile) {
            return ret;
        }
        for (const dir of DIRECTIONS) {
            OFFSET.set(fromX, fromY).addDirection(dir);
            if (!this._size.contains(OFFSET.x, OFFSET.y)) {
                continue;
            }
            if (!curTile.getExit(dir)) {
                continue;
            }
            const dirDist = this._get(OFFSET) + _dirCost(dir);
            if (dirDist === undefined) {
                continue;
            }
            if (dirDist < dist + 0.001) {
                if (dirDist < dist - 0.001) {
                    ret.length = 0;
                    dist = dirDist;
                }
                ret.push(dir);
            }
        }
        return ret;
    }

    private _set(offset: OffsetLike, value: number) {
        this._grid[this._size.index(offset.x, offset.y)] = value;
    }

    private _get(offset: OffsetLike) {
        return this._grid[this._size.index(offset.x, offset.y)];
    }
}
