import { Point } from "../geom/point";
import { Image } from "./image";

export class ImageSet {
    readonly url: URL;
    readonly imageSize: Point;
    readonly count: number;

    constructor(url: URL, imageSize: Point, count: number) {
        this.url = url;
        this.imageSize = imageSize;
        this.count = count;
    }

    getImage(index: number) {
        return new Image(this.url, this.imageSize, new Point(this.imageSize.x * index, 0));
    }
    
}