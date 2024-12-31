import { getTileSvg } from "../track/tile-render";
import { Race } from "../race/race";
import { Size } from "tiled-geometry";
import { TILE_SIZE } from "../track/tile";
import { CarUi } from "./car-ui";
import type { CloudUi } from "./cloud-ui";
import { filterInPlace } from "../util/array";
import { CheckpointUi } from "./checkpoint-ui";
import type { MarkUi } from "./mark-ui";
import { Checkpoint } from "../track/checkpoint";
import { ObstacleUi } from "./obstacle-ui";
import { RaceAudio } from "./race-audio";
import { timeToString } from "../util/time";

export type RaceUiOptions = {
    wireframe?: boolean;
};

export class RaceUi {
    readonly race: Race;
    readonly audio = new RaceAudio(this);

    private readonly _wireframe: boolean;

    private readonly _mainDiv = this._makeLayer('race-main');
    private readonly _trackLayer = this._makeLayer('main-track');
    private readonly _checkpointLayer = this._makeLayer('main-checkpoints');
    private readonly _markLayer = this._makeLayer('main-marks');
    private readonly _thingLayer = this._makeLayer('main-things');
    private readonly _airLayer = this._makeLayer('main-air');

    private readonly _statusDiv: HTMLElement;
    private readonly _countdownDiv: HTMLElement;

    private readonly _miniScale: number;
    private readonly _miniDiv = this._makeLayer('race-mini')
    private readonly _miniTrackLayer = this._makeLayer('mini-track');
    private readonly _miniCheckpointLayer = this._makeLayer('mini-checkpoints');
    private readonly _miniThingLayer = this._makeLayer('mini-things');

    private readonly _carUis: CarUi[] = [];
    private readonly _obstacleUis: ObstacleUi[] = [];
    private readonly _marks: MarkUi[] = [];
    private readonly _clouds: CloudUi[] = [];
    private readonly _start: CheckpointUi;
    private readonly _checkpoints: CheckpointUi[] = [];

    constructor(elem: HTMLElement, race: Race, options?: RaceUiOptions) {
        this.race = race;
        this._wireframe = options?.wireframe ?? false;
        const track = race.track;

        this._mainDiv.style.setProperty('inset', '0');
        elem.appendChild(this._mainDiv);

        this._mainDiv.appendChild(this._trackLayer);
        this._mainDiv.appendChild(this._checkpointLayer);

        for (const offset of new Size().copyFrom(track.size).offsets()) {
            const tile = track.getTile(offset.x, offset.y);
            const svg = getTileSvg(document, track, tile, { wireframe: this._wireframe });
            if (svg) {
                svg.style.setProperty('position', 'absolute');
                svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
                svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
                this._trackLayer.appendChild(svg);
            }
        }

        this._mainDiv.appendChild(this._markLayer);

        this._mainDiv.appendChild(this._thingLayer);

        this._mainDiv.appendChild(this._airLayer);

        this._statusDiv = this._makeLayer('status');
        this._statusDiv.style.setProperty('top', '0');
        this._statusDiv.style.setProperty('left', '0');
        this._statusDiv.style.setProperty('font-size', '50px');
        this._statusDiv.style.setProperty('color', 'white');
        elem.appendChild(this._statusDiv);
        const countdownOuter = this._makeLayer('countdown');
        countdownOuter.style.setProperty('inset', '0');
        countdownOuter.style.setProperty('display', 'flex');
        countdownOuter.style.setProperty('align-items', 'center');
        countdownOuter.style.setProperty('justify-content', 'center');
        this._countdownDiv = document.createElement('div');
        this._countdownDiv.style.setProperty('font-size', '200px');
        this._countdownDiv.style.setProperty('color', 'white');
        countdownOuter.appendChild(this._countdownDiv);
        elem.appendChild(countdownOuter);

        this._miniScale = 200 / Math.max(track.size.width, track.size.height) / TILE_SIZE;
        this._miniDiv = this._makeLayer('mini');
        this._miniDiv.style.setProperty('top', '0');
        this._miniDiv.style.setProperty('right', '0');
        this._miniDiv.style.setProperty('width', `${track.size.width * TILE_SIZE * this._miniScale}px`);
        this._miniDiv.style.setProperty('height', `${track.size.height * TILE_SIZE * this._miniScale}px`);
        this._miniDiv.style.setProperty('background-color', 'black');
        this._miniDiv.style.setProperty('border', '1px solid grey');
        elem.appendChild(this._miniDiv);

        this._miniTrackLayer.style.setProperty('scale', String(this._miniScale));
        this._miniDiv.appendChild(this._miniTrackLayer);
        this._miniDiv.appendChild(this._miniCheckpointLayer);

        for (const offset of new Size().copyFrom(track.size).offsets()) {
            const tile = track.getTile(offset.x, offset.y);
            const svg = getTileSvg(document, track, tile);
            if (svg) {
                svg.style.setProperty('position', 'absolute');
                svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
                svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
                this._miniTrackLayer.appendChild(svg);
            }
        }

        this._miniDiv.appendChild(this._miniThingLayer);

        for (const car of this.race.cars) {
            const carUi = new CarUi(this, car, this._miniScale);
            this._thingLayer.appendChild(carUi.element);
            this._miniThingLayer.appendChild(carUi.miniElement);
            this._carUis.push(carUi);
        }

        for (const obstacle of this.race.obstacles) {
            const obstacleUi = new ObstacleUi(this, obstacle);
            this._thingLayer.appendChild(obstacleUi.element);
            this._obstacleUis.push(obstacleUi);
        }

        this._start = this._makeCheckpointUi(this.race.track.start);
        for (const checkpoint of this.race.track.checkpoints) {
            this._checkpoints.push(this._makeCheckpointUi(checkpoint));
        }
    }

    addMark(mark: MarkUi) {
        this._marks.push(mark);
        this._markLayer.appendChild(mark.element);
    }

    addCloud(cloud: CloudUi) {
        this._clouds.push(cloud);
        this._airLayer.appendChild(cloud.element);
    }

    tick(sec: number) {
        {
            let expired = 0;
            for (const cloud of this._clouds) {
                cloud.tick(sec);
                if (cloud.expired) {
                    if (cloud.element.parentNode) {
                        this._airLayer.removeChild(cloud.element);
                    }
                    expired ++;
                }
            }
            if (expired > 20) {
                filterInPlace(this._clouds, cloud => !cloud.expired);
            }
        }
        {
            let expired = 0;
            for (const mark of this._marks) {
                mark.tick(sec);
                if (mark.expired) {
                    if (mark.element.parentNode) {
                        this._markLayer.removeChild(mark.element);
                    }
                    expired ++;
                }
            }
            if (expired > 20) {
                filterInPlace(this._marks, mark => !mark.expired);
            }
        }
        for (const carUi of this._carUis) {
            carUi.tick(sec)
        }
    }

    update() {
        const { innerWidth, innerHeight } = window;
        const player = this.race.player;
        const offsetX = player.body.position.x - innerWidth / 2;
        const offsetY = player.body.position.y - innerHeight / 2;
        this._mainDiv.style.setProperty('left', `${-offsetX}px`);
        this._mainDiv.style.setProperty('top', `${-offsetY}px`);
        for (const mark of this._marks) {
            mark.update()
        }
        for (const obstacleUi of this._obstacleUis) {
            obstacleUi.update()
        }
        for (const carUi of this._carUis) {
            carUi.update()
        }
        for (const cloud of this._clouds) {
            cloud.update()
        }
        this._start.update();
        for (const checkpoint of this._checkpoints) {
            checkpoint.update()
        }
        if (this.race.state === 'countdown') {
            this._countdownDiv.textContent = String(Math.ceil(this.race.countdownSeconds));
        } else {
            this._countdownDiv.textContent = '';
        }
        if (this.race.state !== 'countdown') {
            const finished = player.finished;
            if (finished) {
                this._statusDiv.textContent = `#${finished.place} ${timeToString(finished.time)}`;
            } else if (player.lap === 0) {
                this._statusDiv.textContent = timeToString(this.race.time);
            } else {
                this._statusDiv.textContent = `${player.lap}/${this.race.laps} ${timeToString(this.race.time)}`;
            }
        }
    }

    destroy() {
        this.audio.destroy();
    }

    //#region Internal

    private _makeLayer(id: string) {
        const layer = document.createElement('div');
        layer.id = id;
        layer.style.setProperty('position', 'absolute');
        return layer;
    }

    private _makeCheckpointUi(checkpoint: Checkpoint) {
        const offset = checkpoint.tile.offset;
        const container = document.createElement('div');
        container.style.setProperty('position', 'absolute');
        container.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
        container.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
        this._checkpointLayer.appendChild(container);
        const miniContainer = document.createElement('div');
        miniContainer.style.setProperty('position', 'absolute');
        miniContainer.style.setProperty('left', `${TILE_SIZE * this._miniScale * offset.x}px`);
        miniContainer.style.setProperty('top', `${TILE_SIZE * this._miniScale * offset.y}px`);
        this._miniCheckpointLayer.appendChild(miniContainer);
        return new CheckpointUi(this, container, miniContainer, checkpoint, this._miniScale, this._wireframe);
    }

    //#endregion

}