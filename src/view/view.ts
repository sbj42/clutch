import type { Thing } from "../thing/thing";
import type { Tile } from "../map/tile";
import { Composite, Engine, Vector } from "matter-js";
import type { Trail } from "../thing/trail";

export class View {
    engine: Engine;

    mapLayer: HTMLElement;
    floorLayer: HTMLElement;
    thingLayer: HTMLElement;

    tiles: Tile[] = [];
    floors: Trail[] = [];
    things: Thing[] = [];
    player: Thing;

    constructor() {
        this.engine = Engine.create({
            gravity: {
                scale: 0,
            }
        });
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

    addTile(tile: Tile) {
        this.mapLayer.appendChild(tile.elem);
        this.tiles.push(tile);
        Composite.add(this.engine.world, tile.bodies);
    }

    addFloor(floor: Trail) {
        this.floorLayer.appendChild(floor.elem);
        this.floors.push(floor);
    }

    addThing(thing: Thing) {
        this.thingLayer.appendChild(thing.elem);
        this.things.push(thing);
        Composite.add(this.engine.world, thing.body);
    }

    draw() {
    }

    tick(sec: number) {
        for (const thing of this.things) {
            thing.tick(sec);
        }
        Engine.update(this.engine, sec * 1000);
        const { clientWidth, clientHeight } = document.body;
        const windowSize = Vector.create(clientWidth, clientHeight);
        const offset = Vector.sub(this.player.body.position, Vector.mult(windowSize, 0.5));
        for (const tile of this.tiles) {
            tile.draw(offset);
        }
        for (const floor of this.floors) {
            floor.draw(offset);
        }
        for (const thing of this.things) {
            thing.draw(offset);
        }
    }

}