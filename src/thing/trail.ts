import './trail.scss';
import { Vector } from "matter-js";
import { SVG_NS } from "../util/html";
import type { View } from "../view/view";

export class Trail {
    readonly view: View;
    readonly elem: HTMLElement | SVGElement;
    private readonly _points: Vector[] = [];
    private _max: Vector = Vector.create(0, 0);
    private _changed: boolean;

    private readonly _path: SVGPathElement;
    private readonly _width: number;

    constructor(view: View, width: number, stroke: string) {
        this.view = view;
        this.elem = document.createElementNS(SVG_NS, 'svg');
        this.elem.classList.add('trail');
        this._width = width;
        this._path = document.createElementNS(SVG_NS, 'polyline');
        this._path.setAttribute('stroke-width', `${width}px`);
        this._path.setAttribute('stroke', stroke);
        this._path.setAttribute('fill', 'none');
        this.elem.appendChild(this._path);
        view.addFloor(this);
    }

    add(point: Vector) {
        this._points.push(point);
        this._max = Vector.create(Math.max(this._max.x, point.x), Math.max(this._max.y, point.y));
        this._changed = true;
    }

    draw(offset: Vector) {
        this.elem.style.setProperty('left', (-this._width - offset.x) + 'px');
        this.elem.style.setProperty('top', (-this._width - offset.y) + 'px');
        if (!this._changed) {
            return;
        }
        this.elem.style.setProperty('width', `${this._max.x + this._width * 2}px`);
        this.elem.style.setProperty('height', `${this._max.y + this._width * 2}px`);
        const pointsStr = this._points
            .map(point => {
                return `${(point.x + this._width).toFixed(1)},${(point.y + this._width).toFixed(1)}`;
            })
            .join(' ');
        this._path.setAttribute('points', pointsStr);
        this._changed = false;
    }
}
