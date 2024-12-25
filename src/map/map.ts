import { Vector } from "matter-js";
import type { View } from "../view/view";
import { basicTile, Tile } from "./tile";
import { Direction, Directions } from "../geom/direction";

export class Map {
    readonly size: Vector;
    readonly tiles: Tile[] = [];

    constructor(view: View, size: Vector) {
        this.size = size;
        view.map = this;
        for (let y = 0; y < size.y; y ++) {
            for (let x = 0; x < size.x; x ++) {
                const exits = new Directions();
                if (x > 0 /* && (y === 0 || y === size.y - 1) */) {
                    exits[Direction.WEST] = true;
                }
                if (x < size.x - 1 /* && (y === 0 || y === size.y - 1) */) {
                    exits[Direction.EAST] = true;
                }
                if (y > 0 /* && (x === 0 || x === size.x - 1) */) {
                    exits[Direction.NORTH] = true;
                }
                if (y < size.y - 1 /* && (x === 0 || x === size.x - 1) */) {
                    exits[Direction.SOUTH] = true;
                }
                const tile = basicTile(view, exits, Vector.create(x, y));
                this.tiles.push(tile);
            }
        }
        view.addCheckpoint(this.getTile(size.x - 1, 0));
        view.addCheckpoint(this.getTile(size.x - 1, size.y - 1));
        view.addCheckpoint(this.getTile(0, size.y - 1));
        view.addCheckpoint(this.getTile(0, 0));
    }

    getTile(x: number, y: number) {
        return this.tiles[y * this.size.x + x];
    }
}