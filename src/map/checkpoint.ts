import type { View } from '../view/view';
import { SVG_NS } from '../util/html';
import { Bodies, Body, Vector } from "matter-js";
import { TILE_SIZE, type Tile } from './tile';

export class Checkpoint {
    readonly rect: SVGRectElement;
    readonly text: SVGTextElement;
    readonly sensor: Body

    constructor(tile: Tile, label: string, size: number) {
        this.rect = document.createElementNS(SVG_NS, 'rect');
        this.rect.setAttribute('x', String((TILE_SIZE - size) / 2));
        this.rect.setAttribute('y', String((TILE_SIZE - size) / 2));
        this.rect.setAttribute('width', String(size));
        this.rect.setAttribute('height', String(size));
        this.rect.setAttribute('stroke-width', '5');
        this.rect.setAttribute('stroke-dasharray', '2');
        this.rect.setAttribute('fill', 'none');
        tile.elem.appendChild(this.rect);
        this.text = document.createElementNS(SVG_NS, 'text');
        this.text.setAttribute('x', String(TILE_SIZE / 2));
        this.text.setAttribute('y', String(TILE_SIZE / 2));
        this.text.setAttribute('font-family', 'monospace');
        this.text.setAttribute('font-size', '60px');
        this.text.setAttribute('text-anchor', 'middle');
        this.text.setAttribute('dominant-baseline', 'middle');
        this.text.style.setProperty('text-align', 'center');
        this.text.textContent = label;
        tile.elem.appendChild(this.text);
        this.sensor = Bodies.rectangle(tile.offset.x + TILE_SIZE / 2, tile.offset.y + TILE_SIZE / 2, size, size, {
            isSensor: true,
        });
    }

    setState(state: 'next' | 'last' | 'inactive') {
        const color = state === 'next' ? 'rgb(248, 248, 41)'
            : state === 'last' ? 'rgb(42, 231, 36)'
            : 'rgb(51, 41, 41)';
        this.rect.setAttribute('stroke', color);
        this.text.setAttribute('fill', color);
    }
}