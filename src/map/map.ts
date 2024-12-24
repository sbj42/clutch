import { Point } from "../geom/point";
import type { View } from "../view/view";
import { basicTile, Tile } from "./tile";

export class Map {
    readonly size: Point;
    readonly tiles: Tile[] = [];

    constructor(view: View, size: Point) {
        this.size = size;
        for (let y = 0; y < size.y; y ++) {
            for (let x = 0; x < size.x; x ++) {
                let exits = '';
                if (x > 0) {
                    exits += 'w';
                }
                if (x < size.x - 1) {
                    exits += 'e';
                }
                if (y > 0) {
                    exits += 'n';
                }
                if (y < size.y - 1) {
                    exits += 's';
                }
                this.tiles.push(new Tile(view, basicTile(exits), new Point(x, y)));
            }
        }
    }
}