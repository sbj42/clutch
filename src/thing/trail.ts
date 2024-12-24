import { Point } from "../geom/point";
import { Points } from "../geom/points";
import { SVG_NS } from "../util/html";
import type { View } from "../view/view";
import { Thing } from "./thing";

export class Trail extends Thing {
    private readonly _points = new Points();
    private _changed: boolean;

    private readonly _path: SVGPathElement;
    private readonly _width: number;

    constructor(view: View, width: number, stroke: string) {
        super(view, document.createElementNS(SVG_NS, 'svg'), Point.ORIGIN, Point.ORIGIN);
        this._width = width;
        this._path = document.createElementNS(SVG_NS, 'polyline');
        this._path.setAttribute('stroke-width', `${width}px`);
        this._path.setAttribute('stroke', stroke);
        this._path.setAttribute('fill', 'none');
        this.elem.appendChild(this._path);
        view.addFloor(this);
    }

    add(point: Point) {
        this._points.add(point);
        this._changed = true;
    }

    draw(offset: Point) {
        if (this._changed) {
            const { bounds } = this._points;
            if (bounds) {
                this.location = bounds.topLeft();
                this.elem.style.setProperty('width', `${bounds.w + this._width * 2}px`)
                this.elem.style.setProperty('height', `${bounds.h + this._width * 2}px`)
            }
            const pointsStr = this._points.points
                .map(point => `${(this._width + point.x - this.location.x).toFixed(1)},${(this._width + point.y - this.location.y).toFixed(1)}`)
                .join(' ');
            this._path.setAttribute('points', pointsStr);
            this._changed = false;
        }
        super.draw(offset);
    }
}
