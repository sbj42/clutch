import { Vector } from "matter-js";
import { Image } from "./image";

export class ImageSet {
    readonly url: URL;
    readonly imageSize: Vector;
    readonly count: number;

    constructor(url: URL, imageSize: Vector, count: number) {
        this.url = url;
        this.imageSize = imageSize;
        this.count = count;
    }

    getImage(index: number) {
        return new Image(this.url, this.imageSize, Vector.create(0, this.imageSize.y * index));
    }
    
}