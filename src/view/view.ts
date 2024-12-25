import type { Thing } from "../thing/thing";
import type { Tile } from "../map/tile";
import { Collision, Composite, Engine, Vector } from "matter-js";
import type { Trail } from "../thing/trail";
import type { Cloud } from "../thing/cloud";
import { Checkpoint } from "../map/checkpoint";
import { Car } from "../thing/car";
import type { Map } from "../map/map";
import type { Ai } from "../ai/ai";
import { getInputDirection } from "./input";

export class View {
    engine: Engine;
    map: Map;

    container: HTMLElement;
    mapLayer: HTMLElement;
    floorLayer: HTMLElement;
    thingLayer: HTMLElement;
    airLayer: HTMLElement;

    tiles: Tile[] = [];
    floors: Trail[] = [];
    things: Thing[] = [];
    cars: Car[] = [];
    clouds: Cloud[] = [];
    checkpoints: Checkpoint[] = [];

    ais: Ai[] = [];
    player: Car;
    active = false;

    constructor(top: HTMLElement) {
        this.engine = Engine.create({
            gravity: {
                scale: 0,
            }
        });
        top.style.setProperty('background-color', 'rgb(29, 29, 29)');
        this.container = this._makeLayer();
        this.container.style.setProperty('inset', '0');
        top.appendChild(this.container);
        this.mapLayer = this._makeLayer();
        this.mapLayer.id = 'map';
        this.container.appendChild(this.mapLayer);
        this.floorLayer = this._makeLayer();
        this.floorLayer.id = 'floors';
        this.container.appendChild(this.floorLayer);
        this.thingLayer = this._makeLayer();
        this.thingLayer.id = 'things';
        this.container.appendChild(this.thingLayer);
        this.airLayer = this._makeLayer();
        this.airLayer.id = 'air';
        this.container.appendChild(this.airLayer);
    }

    private _makeLayer() {
        const layer = document.createElement('div');
        layer.style.setProperty('position', 'absolute');
        return layer;
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
        if (thing instanceof Car) {
            this.cars.push(thing);
        }
        Composite.add(this.engine.world, thing.body);
    }

    addCloud(cloud: Cloud) {
        this.airLayer.appendChild(cloud.elem);
        this.clouds.push(cloud);
    }

    addCheckpoint(tile: Tile) {
        const label = String(this.checkpoints.length + 1);
        this.checkpoints.push(new Checkpoint(tile, label, tile.trackWidth * 0.8));
    }

    addAi(ai: Ai) {
        this.ais.push(ai);
    }

    tick(sec: number) {
        if (this.active) {
            this.player.go(getInputDirection());
            for (const ai of this.ais) {
                ai.tick(sec);
            }
            for (const thing of this.things) {
                thing.tick(sec);
            }
        } else {
            for (const car of this.cars) {
                car.go(undefined);
            }
        }
        this.clouds = this.clouds.filter(cloud => {
            const keep = cloud.tick(sec);
            if (!keep) {
                this.airLayer.removeChild(cloud.elem);
            }
            return keep;
        });
        for (let i = 0; i < this.checkpoints.length; i ++) {
            const checkpoint = this.checkpoints[i];
            for (const car of this.cars) {
                if (car.nextCheckpoint === i && Collision.collides(car.body, checkpoint.sensor)) {
                    car.nextCheckpoint++;
                    if (car.nextCheckpoint >= this.checkpoints.length) {
                        car.nextCheckpoint = 0;
                        car.lap ++;
                    }
                }
            }
            checkpoint.setState(this.player.nextCheckpoint === i ? 'next'
                : this.player.nextCheckpoint === ((i + 1) % this.checkpoints.length) ? 'last'
                : 'inactive');
        }
        Engine.update(this.engine, Math.min(16.667, sec * 1000));
        const { innerWidth, innerHeight } = window;
        const windowSize = Vector.create(innerWidth, innerHeight);
        const offset = Vector.sub(this.player.body.position, Vector.mult(windowSize, 0.5));
        this.container.style.setProperty('left', `${-offset.x}px`);
        this.container.style.setProperty('top', `${-offset.y}px`);
        for (const tile of this.tiles) {
            tile.draw();
        }
        for (const floor of this.floors) {
            floor.draw();
        }
        for (const thing of this.things) {
            thing.draw();
        }
        for (const cloud of this.clouds) {
            cloud.draw();
        }
    }

}