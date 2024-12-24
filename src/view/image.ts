import type { Vector } from "matter-js";

export class Image {
    readonly url: URL;
    readonly size: Vector;
    readonly offset: Vector;

    constructor(url: URL, size: Vector, offset: Vector) {
        this.url = url;
        this.size = size;
        this.offset = offset;
    }

    makeElement(): HTMLElement {
        const ret = document.createElement('div');
        ret.style.setProperty('width', `${this.size.x}px`);
        ret.style.setProperty('height', `${this.size.y}px`);
        ret.style.setProperty('background-image', `url(${this.url})`);
        ret.style.setProperty('background-position', `${-this.offset.x}px ${-this.offset.y}px`);
        return ret;
    }

}