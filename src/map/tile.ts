import { Point } from "../geom/point";
import { Thing } from "../thing/thing";
import type { View } from '../view/view';
import { SVG_NS } from '../util/html';

export const TILE_SIZE = 800;

export class Tile extends Thing {

    constructor(view: View, elem: SVGElement, offset: Point) {
        super(view, elem, Point.ORIGIN, offset.multiply(TILE_SIZE));
        view.addTile(this);
    }
}

export function basicTile(exits: string) {
    const n = exits.includes('n');
    const e = exits.includes('e');
    const s = exits.includes('s');
    const w = exits.includes('w');
    const svg = document.createElementNS(SVG_NS, 'svg');
    const size = TILE_SIZE;
    svg.style.setProperty('width', `${size}px`);
    svg.style.setProperty('height', `${size}px`);
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
    svg.appendChild(path);
    return svg;
}