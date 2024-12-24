import './tile.scss';
import type { View } from '../view/view';
import { SVG_NS } from '../util/html';
import { Body, Vector } from "matter-js";

export const TILE_SIZE = 800;

export class Tile {
    readonly view: View;
    readonly bodies: Body[];
    readonly offset: Vector;
    readonly elem: HTMLElement | SVGElement;

    constructor(view: View, bodies: Body[], elem: SVGElement, offset: Vector) {
        this.view = view;
        this.bodies = bodies;
        this.elem = elem;
        this.offset = Vector.mult(offset, TILE_SIZE);

        this.elem.classList.add('tile');
        view.addTile(this);
    }
    
    draw(offset: Vector) {
        const at = Vector.sub(this.offset, offset);
        this.elem.style.setProperty('left', at.x + 'px');
        this.elem.style.setProperty('top', at.y + 'px');
    }
}

export function basicTile(view: View, exits: string, offset: Vector): Tile {
    const n = exits.includes('n');
    const e = exits.includes('e');
    const s = exits.includes('s');
    const w = exits.includes('w');

    const elem = document.createElementNS(SVG_NS, 'svg');
    const size = TILE_SIZE;
    elem.style.setProperty('width', `${size}px`);
    elem.style.setProperty('height', `${size}px`);
    const path = document.createElementNS(SVG_NS, 'path');
    const trackWidth = size * 0.5;
    const fromEdge = (size - trackWidth) / 2;
    const radius = size * 0.1;
    const inset = fromEdge - radius;
    const topLeft = w && n ? `${0} ${fromEdge} L${inset} ${fromEdge} A${radius} ${radius} 0 0 0 ${fromEdge} ${inset} L${fromEdge} ${0}`
        : w ? `${0} ${fromEdge}`
        : n ? `${fromEdge} ${0}`
        : `${fromEdge} ${fromEdge + radius} A${radius} ${radius} 0 0 1 ${fromEdge + radius} ${fromEdge}`;
    const topRight = n && e ? `${size - fromEdge} ${0} L${size - fromEdge} ${inset} A${radius} ${radius} 0 0 0 ${size - inset} ${fromEdge} L${size} ${fromEdge}`
        : n ? `${size - fromEdge} ${0}`
        : e ? `${size} ${fromEdge}`
        : `${size - fromEdge - radius} ${fromEdge} A${radius} ${radius} 0 0 1 ${size - fromEdge} ${fromEdge + radius}`;
    const bottomRight = e && s ? `${size} ${size - fromEdge} L${size - inset} ${size - fromEdge} A${radius} ${radius} 0 0 0 ${size - fromEdge} ${size - inset} L${size - fromEdge} ${size}`
        : e ? `${size} ${size - fromEdge}`
        : s ? `${size - fromEdge} ${size}`
        : `${size - fromEdge} ${size - fromEdge - radius} A${radius} ${radius} 0 0 1 ${size - fromEdge - radius} ${size - fromEdge}`;
    const bottomLeft = s && w ? `${fromEdge} ${size} L${fromEdge} ${size - inset} A${radius} ${radius} 0 0 0 ${inset} ${size - fromEdge} L${0} ${size - fromEdge}`
        : s ? `${fromEdge} ${size}`
        : w ? `${0} ${size - fromEdge}`
        : `${fromEdge + radius} ${size - fromEdge} A${radius} ${radius} 0 0 1 ${fromEdge} ${size - fromEdge - radius}`;
    const pathStr = 'M' + [topLeft, topRight, bottomRight, bottomLeft].join(' L') + ' Z';
    path.setAttribute('d', pathStr);
    path.setAttribute('fill', 'rgb(97, 62, 34)');
    path.setAttribute('stroke', 'none');
    elem.appendChild(path);

    const bodies: Body[] = [];
    return new Tile(view, bodies, elem, offset);
}