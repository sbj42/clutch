import { Point } from "./point";

export class Rect {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    topLeft() {
        return new Point(this.x, this.y);
    }

    extend(point: Point): Rect {
        const x = Math.min(this.x, point.x);
        const y = Math.min(this.y, point.y);
        const w = Math.max(this.x + this.w, point.x) - x;
        const h = Math.max(this.y + this.h, point.y) - y;
        return new Rect(x, y, w, h);
    }

    toString(): string {
        return `${this.x},${this.y} ${this.w}x${this.h}`;
    }
}