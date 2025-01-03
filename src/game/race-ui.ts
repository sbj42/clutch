import { getTileSvg } from '../track/tile-render';
import { Race } from '../race/race';
import { Size } from 'tiled-geometry';
import { TILE_SIZE } from '../track/tile';
import { CarUi } from './car-ui';
import type { CloudUi } from './cloud-ui';
import { filterInPlace } from '../util/array';
import { CheckpointUi } from './checkpoint-ui';
import type { MarkUi } from './mark-ui';
import { Checkpoint } from '../track/checkpoint';
import { ObstacleUi } from './obstacle-ui';
import { RaceAudio } from './race-audio';
import { timeToString } from '../util/time';
import { getDecorationUi } from './decoration-ui';
import { makeLayer } from '../ui/ui';
import { Options } from './options';

export type RaceUiOptions = {
    wireframe?: boolean;
};

export class RaceUi {
    readonly race: Race;
    readonly audio: RaceAudio;
    readonly gameOptions: Options;

    private readonly _wireframe: boolean;

    private readonly _mainDiv = makeLayer('race-main');
    private readonly _trackLayer = makeLayer('main-track');
    private readonly _checkpointLayer = makeLayer('main-checkpoints');
    private readonly _markLayer = makeLayer('main-marks');
    private readonly _thingLayer = makeLayer('main-things');
    private readonly _airLayer = makeLayer('main-air');

    private readonly _statusDiv: HTMLElement;
    private readonly _countdownDiv: HTMLElement;

    private readonly _miniScale: number;
    private readonly _miniDiv = makeLayer('race-mini')
    private readonly _miniTrackLayer = makeLayer('mini-track');
    private readonly _miniCheckpointLayer = makeLayer('mini-checkpoints');
    private readonly _miniThingLayer = makeLayer('mini-things');

    private readonly _carUis: CarUi[] = [];
    private readonly _obstacleUis: ObstacleUi[] = [];
    private readonly _marks: MarkUi[] = [];
    private readonly _clouds: CloudUi[] = [];
    private readonly _start: CheckpointUi;
    private readonly _checkpoints: CheckpointUi[] = [];

    constructor(elem: HTMLElement, race: Race, gameOptions: Options, raceUiOptions?: RaceUiOptions) {
        this.race = race;
        this._wireframe = raceUiOptions?.wireframe ?? false;
        this.gameOptions = gameOptions;
        this.audio = new RaceAudio(this);
        const track = race.track;
        
        elem.innerHTML = '';
        elem.classList.add('fill');
        elem.style.setProperty('overflow', 'hidden');

        this._mainDiv.classList.add('fill');
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

        this._statusDiv = makeLayer('status');
        this._statusDiv.classList.add('race-status');
        elem.appendChild(this._statusDiv);
        const countdownOuter = makeLayer('countdown');
        countdownOuter.classList.add('race-countdown');
        countdownOuter.classList.add('fill');
        countdownOuter.classList.add('column-layout');
        countdownOuter.classList.add('center');
        this._countdownDiv = document.createElement('div');
        countdownOuter.appendChild(this._countdownDiv);
        elem.appendChild(countdownOuter);

        this._miniScale = 200 / Math.max(track.size.width, track.size.height) / TILE_SIZE;
        this._miniDiv = makeLayer('mini');
        this._miniDiv.classList.add('race-minimap');
        this._miniDiv.style.setProperty('width', `${track.size.width * TILE_SIZE * this._miniScale}px`);
        this._miniDiv.style.setProperty('height', `${track.size.height * TILE_SIZE * this._miniScale}px`);
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

        for (const decoration of track.decorations) {
            const image = getDecorationUi(decoration);
            this._trackLayer.appendChild(image);
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
                    cloud.element.remove();
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
                    mark.element.remove();
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