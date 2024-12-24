import type { Point } from "./point";
import { Rect } from "./rect";

const MIN_DIST = 5;

export class Points {
    readonly points: Point[] = [];
    bounds?: Rect;

    constructor() {
    }

    add(point: Point) {
        if (this.points.length > 0 && point.subtract(this.points[this.points.length - 1]).magnitude() < MIN_DIST) {
            return;
        }
        this.points.push(point);
        this.bounds = this.bounds ? this.bounds.extend(point) : new Rect(point.x, point.y, 0, 0);
    }

    toString(): string {
        return `${this.points.length} points`;
    }
}