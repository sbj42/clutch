import { OffsetLike, SizeLike } from "tiled-geometry";

export class Image {
    readonly url: URL;
    readonly size: SizeLike;
    readonly offset: OffsetLike;

    constructor(url: URL, size: SizeLike, offset: OffsetLike) {
        this.url = url;
        this.size = size;
        this.offset = offset;
    }

    makeElement(): HTMLElement {
        const ret = document.createElement('div');
        ret.style.setProperty('width', `${this.size.width}px`);
        ret.style.setProperty('height', `${this.size.height}px`);
        ret.style.setProperty('background-image', `url(${this.url})`);
        ret.style.setProperty('background-position', `${-this.offset.x}px ${-this.offset.y}px`);
        return ret;
    }

}