import { Point } from "../geom/point";
import type { View } from "../view/view";

import './thing.scss';

export class Thing {
    readonly view: View;
    readonly elem: HTMLElement | SVGElement;
    readonly elemOffset: Point;
    location: Point;
    angle = 0;

    constructor(view: View, elem: HTMLElement | SVGElement, elemOffset: Point, location: Point) {
        this.view = view;
        this.elem = elem;
        this.elemOffset = elemOffset;
        this.location = location;

        this.elem.classList.add('thing');
        this.elem.style.setProperty('transform-origin', `${elemOffset.x}px ${elemOffset.y}px`);
    }

    draw(offset: Point) {
        this.elem.style.setProperty('left', offset.x + 'px');
        this.elem.style.setProperty('top', offset.y + 'px');
        this.elem.style.setProperty('transform', `rotate(${this.angle}deg)`);
    }
}