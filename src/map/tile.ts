import type { View } from '../view/view';
import { SVG_NS } from '../util/html';
import { Bodies, Body, Vector } from "matter-js";
import { Direction, type Directions } from '../geom/direction';
import { STANDARD_TRACK_RADIUS, STANDARD_TRACK_WIDTH, TILE_SIZE } from '../constants';

export class Tile {
    readonly view: View;
    readonly bodies: Body[];
    readonly exits: Directions;
    readonly elem: SVGElement;
    readonly offset: Vector;
    readonly trackWidth: number;

    constructor(view: View, bodies: Body[], elem: SVGElement, offset: Vector, trackWidth: number, exits: Directions) {
        this.view = view;
        this.bodies = bodies;
        this.elem = elem;
        this.offset = offset;
        this.trackWidth = trackWidth;
        this.exits = exits;

        // this.elem.style.setProperty('border', '1px solid green');
        this.elem.style.setProperty('position', 'absolute');
        this.elem.style.setProperty('left', offset.x + 'px');
        this.elem.style.setProperty('top', offset.y + 'px');
        this.elem.classList.add('tile');
        view.addTile(this);
    }
    
    draw() {
    }
}

export function basicTile(view: View, exits: Directions, offset: Vector): Tile {
    const n = exits[Direction.NORTH];
    const e = exits[Direction.EAST];
    const s = exits[Direction.SOUTH];
    const w = exits[Direction.WEST];
    offset = Vector.mult(offset, TILE_SIZE);
    const bodies: Body[] = [];

    const elem = document.createElementNS(SVG_NS, 'svg');
    const size = TILE_SIZE;
    elem.style.setProperty('width', `${size}px`);
    elem.style.setProperty('height', `${size}px`);
    const path = document.createElementNS(SVG_NS, 'path');
    const trackWidth = STANDARD_TRACK_WIDTH;
    const fromEdge = (size - trackWidth) / 2;
    const radius = STANDARD_TRACK_RADIUS;
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

    if (!n) {
        bodies.push(Bodies.rectangle(offset.x + size / 2, offset.y + fromEdge / 2, size, fromEdge, {
            isStatic: true,
        }));
    } else {
        if (w) {
            bodies.push(Bodies.rectangle(offset.x + fromEdge / 2, offset.y + (fromEdge - radius) / 2, fromEdge, fromEdge - radius, {
                isStatic: true,
            }));
        }
        if (e) {
            bodies.push(Bodies.rectangle(offset.x + size - fromEdge / 2, offset.y + (fromEdge - radius) / 2, fromEdge, fromEdge - radius, {
                isStatic: true,
            }));
        }
    }
    if (!s) {
        bodies.push(Bodies.rectangle(offset.x + size / 2, offset.y + size - fromEdge / 2, size, fromEdge, {
            isStatic: true,
        }));
    } else {
        if (w) {
            bodies.push(Bodies.rectangle(offset.x + fromEdge / 2, offset.y + size - (fromEdge - radius) / 2, fromEdge, fromEdge - radius, {
                isStatic: true,
            }));
        }
        if (e) {
            bodies.push(Bodies.rectangle(offset.x + size - fromEdge / 2, offset.y + size - (fromEdge - radius) / 2, fromEdge, fromEdge - radius, {
                isStatic: true,
            }));
        }
    }
    if (!w) {
        bodies.push(Bodies.rectangle(offset.x + fromEdge / 2, offset.y + size / 2, fromEdge, size, {
            isStatic: true,
        }));
    } else {
        if (n) {
            bodies.push(Bodies.rectangle(offset.x + (fromEdge - radius)  / 2, offset.y + fromEdge / 2, fromEdge - radius, fromEdge, {
                isStatic: true,
            }));
        }
        if (s) {
            bodies.push(Bodies.rectangle(offset.x + (fromEdge - radius)  / 2, offset.y + size - fromEdge / 2, fromEdge - radius, fromEdge, {
                isStatic: true,
            }));
        }
    }
    if (!e) {
        bodies.push(Bodies.rectangle(offset.x + size - fromEdge / 2, offset.y + size / 2, fromEdge, size, {
            isStatic: true,
        }));
    } else {
        if (n) {
            bodies.push(Bodies.rectangle(offset.x + size - (fromEdge - radius)  / 2, offset.y + fromEdge / 2, fromEdge - radius, fromEdge, {
                isStatic: true,
            }));
        }
        if (s) {
            bodies.push(Bodies.rectangle(offset.x + size - (fromEdge - radius)  / 2, offset.y + size - fromEdge / 2, fromEdge - radius, fromEdge, {
                isStatic: true,
            }));
        }
    }
    if (n && w) {
        bodies.push(Bodies.circle(offset.x + fromEdge - radius, offset.y + fromEdge - radius, radius, {
            isStatic: true,
        }));
    }
    if (n && e) {
        bodies.push(Bodies.circle(offset.x + size - (fromEdge - radius), offset.y + fromEdge - radius, radius, {
            isStatic: true,
        }));
    }
    if (s && e) {
        bodies.push(Bodies.circle(offset.x + size - (fromEdge - radius), offset.y + size - (fromEdge - radius), radius, {
            isStatic: true,
        }));
    }
    if (s && w) {
        bodies.push(Bodies.circle(offset.x + fromEdge - radius, offset.y + size - (fromEdge - radius), radius, {
            isStatic: true,
        }));
    }

    return new Tile(view, bodies, elem, offset, trackWidth, exits);
}