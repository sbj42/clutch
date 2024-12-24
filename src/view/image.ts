import type { Point } from "../geom/point";

export class Image {
    readonly url: URL;
    readonly size: Point;
    readonly offset: Point;

    constructor(url: URL, size: Point, offset: Point) {
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