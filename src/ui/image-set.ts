import { Vector } from "matter-js";
import { Image } from "./image";
import { Size } from "tiled-geometry";

export class ImageSet {
    readonly url: URL;
    readonly imageSize: Size;
    readonly count: number;

    constructor(url: URL, imageSize: Size, count: number) {
        this.url = url;
        this.imageSize = imageSize;
        this.count = count;
    }

    getImage(index: number) {
        return new Image(this.url, this.imageSize, Vector.create(0, this.imageSize.height * index));
    }
    
}