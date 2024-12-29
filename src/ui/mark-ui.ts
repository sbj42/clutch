import { Vector } from "matter-js";
import { makeSvg, makeSvgPolyline } from "../util/svg";

const MINIMUM_DISTANCE = 10;
const FADE_START = 25;
const DURATION = 30;

export class MarkUi {
    readonly element: SVGElement;
    
    private readonly _strokeWidth: number;
    private _lastPoint?: Vector;
    private _points: string[] = [];
    private _max = Vector.create(0, 0);
    private _changed = false;
    private _path: SVGPolylineElement;
    private _time = 0;

    constructor(stroke: string, strokeWidth: number) {
        this._strokeWidth = strokeWidth;
        this.element = makeSvg(document, {
            width: 0,
            height: 0,
        });
        this.element.style.setProperty('position', 'absolute');
        this._path = makeSvgPolyline(document, {
            stroke,
            strokeWidth,
        });
        this.element.appendChild(this._path);
    }

    add(point: Vector) {
        if (this._lastPoint && Vector.magnitude(Vector.sub(point, this._lastPoint)) < MINIMUM_DISTANCE) {
            return;
        }
        this._lastPoint = point;
        this._points.push(`${point.x.toFixed(1)},${point.y.toFixed(1)}`);
        this._max.x = Math.max(this._max.x, point.x + this._strokeWidth);
        this._max.y = Math.max(this._max.y, point.y + this._strokeWidth);
        this._changed = true;
    }

    get expired() {
        return this._time > DURATION;
    }

    tick(sec: number) {
        this._time += sec;
    }

    update() {
        this.element.style.setProperty('opacity', String(1 - (Math.max(FADE_START, this._time) - FADE_START) / (DURATION - FADE_START)));
        if (!this._changed) {
            return;
        }
        this.element.setAttribute('viewBox', `0 0 ${this._max.x} ${this._max.y}`);
        this.element.setAttribute('width', `${this._max.x + this._strokeWidth * 2}px`);
        this.element.setAttribute('height', `${this._max.y + this._strokeWidth * 2}px`);
        this._path.setAttribute('points', this._points.join(' '));
        this._changed = false;
    }
}
