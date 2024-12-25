import { Vector } from "matter-js";
import { SVG_NS } from "../util/html";
import type { View } from "../view/view";

export class Cloud {
    readonly view: View;
    readonly elem: HTMLElement | SVGElement;
    position: Vector;
    velocity: Vector;
    radius: number;
    time = 0;
    opacity: number;

    private readonly _circle: SVGCircleElement;

    constructor(view: View, position: Vector, velocity: Vector) {
        this.view = view;
        this.elem = document.createElementNS(SVG_NS, 'svg');
        this.elem.style.setProperty('position', 'absolute');
        this.elem.classList.add('cloud');
        this.radius = 4;
        this.opacity = 0.05;
        this.position = position;
        this.velocity = velocity;
        this._circle = document.createElementNS(SVG_NS, 'circle');
        this._circle.setAttribute('fill', 'white');
        this.elem.appendChild(this._circle);
        this._updateCircle();
        view.addCloud(this);
    }

    private _updateCircle() {
        this._circle.setAttribute('cx', String(this.radius));
        this._circle.setAttribute('cy', String(this.radius));
        this._circle.setAttribute('r', String(this.radius));
        this._circle.setAttribute('opacity', String(this.opacity));
    }

    tick(sec: number) {
        this.position = Vector.add(this.position, Vector.mult(this.velocity, 30 * sec));
        this.radius += sec * 100;
        this.velocity = Vector.mult(this.velocity, 0.98);
        this.opacity *= 0.94;
        this.time += sec;
        return this.time < 2;
    }

    draw() {
        const at = Vector.sub(this.position, Vector.create(this.radius, this.radius));
        this._updateCircle();
        this.elem.style.setProperty('left', at.x + 'px');
        this.elem.style.setProperty('top', at.y + 'px');
        this.elem.style.setProperty('width', `${this.radius * 2}px`);
        this.elem.style.setProperty('height', `${this.radius * 2}px`);
    }
}
