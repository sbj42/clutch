import { Size, type SizeLike } from "tiled-geometry";
import { Image } from "./image";

export class ImageSet {
    readonly url: URL;
    private readonly _imageSize = new Size();
    readonly count: number;

    constructor(url: URL, imageSize: SizeLike, count: number) {
        this.url = url;
        this._imageSize.copyFrom(imageSize);
        this.count = count;
    }

    get imageSize(): SizeLike {
        return this._imageSize;
    }

    get(index: number) {
        if (index < 0 || index >= this.count) {
            throw new Error('invalid image index');
        }
        return new Image(this.url, this._imageSize, 0, this._imageSize.height * index).makeElement();
    }
    
}