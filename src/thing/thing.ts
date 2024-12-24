import { Vector, type Body } from "matter-js";
import type { View } from "../view/view";

import './thing.scss';

export class Thing {
    readonly view: View;
    readonly body: Body;
    readonly elem: HTMLElement | SVGElement;
    readonly elemOffset: Vector;

    constructor(view: View, body: Body, elem: HTMLElement | SVGElement, elemOffset: Vector) {
        this.view = view;
        this.body = body;
        this.elem = elem;
        this.elemOffset = elemOffset;

        this.elem.classList.add('thing');
        this.elem.style.setProperty('transform-origin', `${elemOffset.x}px ${elemOffset.y}px`);
    }

    draw(offset: Vector) {
        const at = Vector.sub(Vector.sub(this.body.position, this.elemOffset), offset);
        this.elem.style.setProperty('left', at.x + 'px');
        this.elem.style.setProperty('top', at.y + 'px');
        this.elem.style.setProperty('transform', `rotate(${this.body.angle}rad)`);
    }

    tick(sec: number) {
    }
}