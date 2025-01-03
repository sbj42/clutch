import { Bodies, Body, Composite, Engine, Query, Vector } from "matter-js";
import { Track } from "../track/track";
import { Size } from "tiled-geometry";
import { getTileComposite } from "../track/tile-render";
import { Car } from "./car";
import { Ai, AiType } from "../ai/ai";
import { TILE_SIZE } from "../track/tile";
import { getCheckpointSensor, getStartGrid } from "../track/checkpoint-render";
import { getInputDirection } from "../game/input";
import { CarType, getAiCarType, getCarCollisionSize, getPlayerCarType } from "./car-type";
import { Checkpoint } from "../track/checkpoint";
import { Obstacle } from "./obstacle";
import { rotateInPlace } from "../geom/vector";

export type RaceCar = {
    type: CarType;
    ai: AiType | undefined;
}

export type RaceState = 'countdown' | 'go' | 'finished';

export type Difficulty = 'easy' | 'normal' | 'hard';

const VEC = Vector.create();

export class Race {
    readonly track: Track;
    readonly player: Car;
    readonly laps: number;
    readonly difficulty: Difficulty;
    
    private readonly _engine: Engine;
    private readonly _cars: Car[] = [];
    private readonly _obstacles: Obstacle[] = [];
    private readonly _ais: Ai[] = [];
    private readonly _startSensor: Body;
    private readonly _checkpointSensors: Body[] = [];

    private _state: RaceState = 'countdown';
    private _countdownSeconds = 3;
    private _carsPlaced = 0;
    private _time = 0;

    constructor(track: Track, laps: number, difficulty: Difficulty) {
        this.track = track;
        this.laps = laps;
        this.difficulty = difficulty;
        this._engine = Engine.create({
            gravity: {
                scale: 0,
            }
        });
        this._state = 'countdown';
        this._startSensor = this._makeCheckpointSensor(this.track.start);
        this._addTiles();

        const cars: RaceCar[] = [];
        switch (difficulty) {
            case 'easy':
                cars.push(
                    { type: getPlayerCarType(0, difficulty), ai: undefined },
                    { type: getAiCarType(1, difficulty, 0.9), ai: { } },
                    { type: getAiCarType(2, difficulty, 0.95), ai: { } },
                    { type: getAiCarType(3, difficulty, 1), ai: { } },
                );
                break;
            case 'normal':
                cars.push(
                    { type: getAiCarType(1, difficulty, 0.85), ai: { } },
                    { type: getAiCarType(2, difficulty, 0.9), ai: { } },
                    { type: getPlayerCarType(0, difficulty), ai: undefined },
                    { type: getAiCarType(3, difficulty, 0.95), ai: { } },
                    { type: getAiCarType(4, difficulty, 1), ai: { } },
                );
                break;
            case 'hard':
                cars.push(
                    { type: getAiCarType(1, difficulty, 0.92), ai: { } },
                    { type: getAiCarType(2, difficulty, 0.94), ai: { } },
                    { type: getAiCarType(3, difficulty, 0.96), ai: { } },
                    { type: getAiCarType(4, difficulty, 0.98), ai: { } },
                    { type: getAiCarType(5, difficulty, 1), ai: { } },
                    { type: getPlayerCarType(0, difficulty), ai: undefined },
                );
                break;
        }
        
        for (const c of cars) {
            const car = this._addCar(c.type);
            if (!c.ai) {
                this.player = car;
            } else {
                this._ais.push(new Ai(this, car, c.ai));
            }
        }
        for (const o of track.obstacles) {
            const obstacle = new Obstacle(this, o);
            this._obstacles.push(obstacle);
            Composite.add(this._engine.world, obstacle.body);
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

    get obstacles(): readonly Obstacle[] {
        return this._obstacles;
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
        const ret = ++ this._carsPlaced;
        if (ret === this._cars.length) {
            this._state = 'finished';
        }
        return ret;
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
        for (const obstacle of this._obstacles) {
            obstacle.tick(sec);
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
                VEC.x = offset.x * TILE_SIZE;
                VEC.y = offset.y * TILE_SIZE;
                Composite.translate(composite, VEC);
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
        VEC.x = offset.x * TILE_SIZE;
        VEC.y = offset.y * TILE_SIZE;
        Body.translate(sensor, VEC);
        Composite.add(this._engine.world, sensor);
        return sensor;
    }

    private _addCar(type: CarType) {
        const collisionSize = getCarCollisionSize(type);
        const start = this.track.start;
        const grid = getStartGrid(start, (this._cars.length + 1) * 2);
        const tileOffset = start.tile.offset;
        const tileLeft = tileOffset.x * TILE_SIZE;
        const tileTop = tileOffset.y * TILE_SIZE;
        let body: Body | undefined;
        for (const cell of grid.cells) {
            VEC.x = collisionSize.width / 2;
            VEC.y = 0;
            rotateInPlace(VEC, grid.angle - Math.PI / 2);
            const x = tileLeft + cell.x - VEC.x;
            const y = tileTop + cell.y - VEC.y;
            body = Bodies.rectangle(x, y, collisionSize.width, collisionSize.height, {
                label: `car:${this._cars.length}`,
                angle: grid.angle - Math.PI / 2,
                frictionAir: type.friction,
                restitution: 0.4,
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
        const car = new Car(this, this._cars.length, body, type);
        this._cars.push(car);
        Composite.add(this._engine.world, body);
        return car;
    }
    
}
