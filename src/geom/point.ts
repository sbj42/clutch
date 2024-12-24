export class Point {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static ORIGIN = new Point(0, 0);

    add(other: Point) {
        return new Point(this.x + other.x, this.y + other.y);
    }

    subtract(other: Point) {
        return new Point(this.x - other.x, this.y - other.y);
    }

    rotate(a: number) {
        const s = Math.sin(a * Math.PI / 180);
        const c = Math.cos(a * Math.PI / 180);
        const x = this.x * c - this.y * s;
        const y = this.x * s + this.y * c;
        return new Point(x, y);
    }

    angle() {
        return Math.atan2(this.x, -this.y) * 180 / Math.PI;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    multiply(val: number) {
        return new Point(this.x * val, this.y * val);
    }

    toString() {
        return `${this.x},${this.y}`;
    }
}