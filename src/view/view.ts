import type { Thing } from "../thing/thing";
import { Point } from "../geom/point";
import type { Tile } from "../map/tile";

export class View {
    offset: Point;

    mapLayer: HTMLElement;
    floorLayer: HTMLElement;
    thingLayer: HTMLElement;

    tiles: Tile[] = [];
    floors: Thing[] = [];
    things: Thing[] = [];

    constructor() {
        this.mapLayer = document.createElement('div');
        this.mapLayer.classList.add('viewlayer');
        this.mapLayer.classList.add('maplayer');
        document.body.appendChild(this.mapLayer);
        this.floorLayer = document.createElement('div');
        this.floorLayer.classList.add('viewlayer');
        this.floorLayer.classList.add('floorlayer');
        document.body.appendChild(this.floorLayer);
        this.thingLayer = document.createElement('div');
        this.thingLayer.classList.add('viewlayer');
        this.thingLayer.classList.add('thinglayer');
        document.body.appendChild(this.thingLayer);
    }

    prep(center: Point) {
        const { clientWidth, clientHeight } = document.body;
        const windowSize = new Point(clientWidth, clientHeight);
        this.offset = center.subtract(windowSize.multiply(0.5));
    }

    addTile(tile: Tile) {
        this.mapLayer.appendChild(tile.elem);
        this.tiles.push(tile);
    }

    addFloor(floor: Thing) {
        this.floorLayer.appendChild(floor.elem);
        this.floors.push(floor);
    }

    addThing(thing: Thing) {
        this.thingLayer.appendChild(thing.elem);
        this.things.push(thing);
    }

    draw() {
        for (const tile of this.tiles) {
            this._draw(tile);
        }
        for (const floor of this.floors) {
            this._draw(floor);
        }
        for (const thing of this.things) {
            this._draw(thing);
        }
    }

    private _draw(thing: Thing) {
        const offset = thing.location.subtract(thing.elemOffset).subtract(this.offset);
        thing.draw(offset);
    }

}