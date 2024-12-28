import { getTileSvg } from "../track/track-tile-render";
import { Race } from "../game/race";
import { Size } from "tiled-geometry";
import { TILE_SIZE } from "../constants";
import { CarUi } from "./car-ui";
import { Vector } from "matter-js";
import type { CloudUi } from "./cloud-ui";
import { filterInPlace } from "../util/array";
import { CheckpointUi } from "./checkpoint-ui";
import type { MarkUi } from "./mark-ui";

export type RaceUiOptions = {
    wireframe?: boolean;
};

export class RaceUi {
    readonly race: Race;

    private readonly _wireframe: boolean;

    private readonly _mainDiv: HTMLElement;
    private readonly _trackLayer: HTMLElement;
    private readonly _checkpointLayer: HTMLElement;
    private readonly _markLayer: HTMLElement;
    private readonly _thingLayer: HTMLElement;
    private readonly _airLayer: HTMLElement;

    private readonly _statusDiv: HTMLElement;
    private readonly _countdownDiv: HTMLElement;

    private readonly _miniScale: number;
    private readonly _miniDiv: HTMLElement;
    private readonly _miniTrackLayer: HTMLElement;
    private readonly _miniCheckpointLayer: HTMLElement;
    private readonly _miniThingLayer: HTMLElement;

    private readonly _carUis: CarUi[] = [];
    private readonly _marks: MarkUi[] = [];
    private readonly _clouds: CloudUi[] = [];
    private readonly _checkpoints: CheckpointUi[] = [];

    constructor(elem: HTMLElement, race: Race, options?: RaceUiOptions) {
        this.race = race;
        this._wireframe = options?.wireframe ?? false;
        const track = race.track;

        elem.style.setProperty('background-color', 'rgb(29, 29, 29)');
        elem.style.setProperty('font-family', 'sans-serif');
        elem.innerHTML = '';
        this._mainDiv = this._makeLayer('main');
        this._mainDiv.style.setProperty('inset', '0');
        elem.appendChild(this._mainDiv);

        this._trackLayer = this._makeLayer('track');
        this._mainDiv.appendChild(this._trackLayer);
        this._checkpointLayer = this._makeLayer('checkpoints');
        this._mainDiv.appendChild(this._checkpointLayer);

        for (const offset of new Size().copyFrom(track.size).offsets()) {
            const tile = track.getTile(offset.x, offset.y);
            const svg = getTileSvg(document, tile, { wireframe: this._wireframe });
            if (svg) {
                svg.style.setProperty('position', 'absolute');
                svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
                svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
                this._trackLayer.appendChild(svg);
            }
        }

        this._markLayer = this._makeLayer('marks');
        this._mainDiv.appendChild(this._markLayer);

        this._thingLayer = this._makeLayer('things');
        this._mainDiv.appendChild(this._thingLayer);

        this._airLayer = this._makeLayer('air');
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
        elem.appendChild(this._miniDiv);

        this._miniTrackLayer = this._makeLayer('minitrack');
        this._miniTrackLayer.style.setProperty('background-color', 'black');
        this._miniTrackLayer.style.setProperty('scale', String(this._miniScale));
        this._miniDiv.appendChild(this._miniTrackLayer);
        this._miniCheckpointLayer = this._makeLayer('minicheckpoints');
        this._miniDiv.appendChild(this._miniCheckpointLayer);

        for (const offset of new Size().copyFrom(track.size).offsets()) {
            const tile = track.getTile(offset.x, offset.y);
            const svg = getTileSvg(document, tile);
            if (svg) {
                svg.style.setProperty('position', 'absolute');
                svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
                svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
                this._miniTrackLayer.appendChild(svg);
            }
        }

        this._miniThingLayer = this._makeLayer('minithings');
        this._miniDiv.appendChild(this._miniThingLayer);

        for (const car of this.race.cars) {
            const carUi = new CarUi(this, car, this._miniScale);
            this._thingLayer.appendChild(carUi.element);
            this._miniThingLayer.appendChild(carUi.miniElement);
            this._carUis.push(carUi);
        }

        for (const checkpoint of this.race.track.checkpoints) {
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
            const checkpointUi = new CheckpointUi(this, container, miniContainer, checkpoint, this._miniScale, this._wireframe);
            this._checkpoints.push(checkpointUi);
        }
    }

    private _makeLayer(id: string) {
        const layer = document.createElement('div');
        layer.id = id;
        layer.style.setProperty('position', 'absolute');
        return layer;
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
        for (const carUi of this._carUis) {
            carUi.tick(sec)
        }
    }

    update() {
        const { innerWidth, innerHeight } = window;
        const windowSize = Vector.create(innerWidth, innerHeight);
        const player = this.race.player;
        const offset = Vector.sub(player.body.position, Vector.mult(windowSize, 0.5));
        this._mainDiv.style.setProperty('left', `${-offset.x}px`);
        this._mainDiv.style.setProperty('top', `${-offset.y}px`);
        for (const mark of this._marks) {
            mark.update()
        }
        for (const carUi of this._carUis) {
            carUi.update()
        }
        for (const cloud of this._clouds) {
            cloud.update()
        }
        for (const checkpoint of this._checkpoints) {
            checkpoint.update()
        }
        if (this.race.state === 'countdown') {
            this._countdownDiv.textContent = String(Math.ceil(this.race.countdownSeconds));
        } else {
            this._countdownDiv.textContent = '';
        }
        if (this.race.state !== 'countdown') {
            if (player.place) {
                this._statusDiv.textContent = `#${player.place}`;
            } else {
                this._statusDiv.textContent = `${player.lap}/${this.race.laps}`;
            }
        }
    }

}