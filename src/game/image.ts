import { Size, SizeLike } from "tiled-geometry";

export class Image {
    readonly url: URL;
    private readonly _size = new Size();
    private readonly _offsetX: number;
    private readonly _offsetY: number;

    constructor(url: URL, size: SizeLike);
    constructor(url: URL, size: SizeLike, offsetX: number, offsetY: number);
    constructor(url: URL, size: SizeLike, offsetX?: number, offsetY?: number) {
        this.url = url;
        this._size.copyFrom(size);
        this._offsetX = offsetX ?? 0;
        this._offsetY = offsetY ?? 0;
    }

    get size(): SizeLike {
        return this._size;
    }

    makeElement(): HTMLElement {
        const ret = document.createElement('div');
        ret.style.setProperty('width', `${this.size.width}px`);
        ret.style.setProperty('height', `${this.size.height}px`);
        ret.style.setProperty('background-image', `url(${this.url})`);
        ret.style.setProperty('background-position', `${-this._offsetX}px ${-this._offsetY}px`);
        return ret;
    }

}