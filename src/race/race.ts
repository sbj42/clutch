import { Bodies, Body, Composite, Engine, Query, Vector } from "matter-js";
import { Track } from "../track/track";
import { Size } from "tiled-geometry";
import { getTileComposite } from "../track/tile-render";
import { Car } from "./car";
import { Ai, AiType } from "../ai/ai";
import { TILE_SIZE } from "../track/tile";
import { getCheckpointSensor, getStartGrid } from "../track/checkpoint-render";
import { getInputDirection } from "../ui/input";
import { CarType, getCarCollisionSize } from "./car-type";
import { Checkpoint } from "../track/checkpoint";

export type RaceCar = {
    type: CarType;
    ai: AiType | undefined;
}

export type RaceState = 'countdown' | 'go' | 'done';

export class Race {
    readonly track: Track;
    readonly player: Car;
    readonly laps: number;
    
    private readonly _engine: Engine;
    private readonly _cars: Car[] = [];
    private readonly _ais: Ai[] = [];
    private readonly _startSensor: Body;
    private readonly _checkpointSensors: Body[] = [];

    private _state: RaceState = 'countdown';
    private _countdownSeconds = 3;
    private _carsPlaced = 0;
    private _time = 0;

    constructor(track: Track, cars: RaceCar[], laps: number) {
        this.track = track;
        this.laps = laps;
        this._engine = Engine.create({
            gravity: {
                scale: 0,
            }
        });
        this._state = 'countdown';
        this._startSensor = this._makeCheckpointSensor(this.track.start);
        this._addTiles();
        
        for (const c of cars) {
            const car = this._addCar(c.type);
            if (!c.ai) {
                this.player = car;
            } else {
                this._ais.push(new Ai(this, car, c.ai));
            }
        }
    }

    get state() {
        return this._state;
    }

    get countdownSeconds() {
        return this._countdownSeconds;
    }

    get cars(): readonly Car[] {
        return this._cars;
    }

    get time() {
        return this._time;
    }

    getStartSensor() {
        return this._startSensor;
    }

    getCheckpointSensor(index: number) {
        return this._checkpointSensors[index];
    }

    claimPlace(): number {
        return ++ this._carsPlaced;
    }

    tick(sec: number) {
        if (this._state === 'go') {
            this._time += sec;
            this.player.go(getInputDirection());
            this.player.tick(sec);
            for (const ai of this._ais) {
                ai.tick(sec);
            }
        } else {
            for (const car of this._cars) {
                car.go(undefined);
            }
        }
        for (const car of this._cars) {
            car.tick(sec);
        }
        Engine.update(this._engine, sec * 1000);
        if (this._state === 'countdown') {
            this._countdownSeconds -= sec;
            if (this._countdownSeconds <= 0) {
                this._state = 'go';
            }
        }
    }

    private _addTiles() {
        for (const offset of new Size().copyFrom(this.track.size).offsets()) {
            const tile = this.track.getTile(offset.x, offset.y);
            const composite = getTileComposite(tile);
            if (composite) {
                Composite.translate(composite, Vector.mult(Vector.create(offset.x, offset.y), TILE_SIZE));
                Composite.add(this._engine.world, composite);
            }
        }
        for (const checkpoint of this.track.checkpoints) {
            this._checkpointSensors.push(this._makeCheckpointSensor(checkpoint));
        }
    }

    private _makeCheckpointSensor(checkpoint: Checkpoint) {
        const offset = checkpoint.tile.offset;
        const sensor = getCheckpointSensor(checkpoint);
        Body.translate(sensor, Vector.mult(Vector.create(offset.x, offset.y), TILE_SIZE));
        Composite.add(this._engine.world, sensor);
        return sensor;
    }

    private _addCar(type: CarType) {
        const collisionSize = getCarCollisionSize(type);
        const start = this.track.start;
        const grid = getStartGrid(start, (this._cars.length + 1) * 2);
        const tileOffset = start.tile.offset;
        const tileTopLeft = Vector.create(tileOffset.x * TILE_SIZE, tileOffset.y * TILE_SIZE);
        let body: Body | undefined;
        for (const cell of grid.cells) {
            const position = Vector.sub(Vector.add(tileTopLeft, cell), Vector.rotate(Vector.create(collisionSize.width / 2, 0), grid.angle - Math.PI / 2));
            body = Bodies.rectangle(position.x, position.y, collisionSize.width, collisionSize.height, {
                label: `car:${this._cars.length}`,
                angle: grid.angle - Math.PI / 2,
                friction: 1,
                restitution: 0.8,
            });
            const collision = Query.collides(body, Composite.allBodies(this._engine.world))
                .filter(col => {
                    return !col.bodyA.isSensor && !col.bodyB.isSensor;
                });
            if (collision.length === 0) {
                break;
            }
        }
        if (!body) {
            throw new Error('failed to find start position');
        }
        const car = new Car(this, body, type);
        this._cars.push(car);
        Composite.add(this._engine.world, body);
        return car;
    }
    
}
