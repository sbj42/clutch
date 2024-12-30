import { Size } from "tiled-geometry";
import { getStandardCarType } from "../race/car-type";
import { Race } from "../race/race";
import { TILE_SIZE } from "../track/tile";
import { Track } from "../track/track";
import { CATERPILLAR } from "../track/tracks/caterpillar";
import { DOGBONE } from "../track/tracks/dogbone";
import { delay } from "../util/delay";
import { RaceUi } from "./race-ui";
import { getTileSvg } from "../track/tile-render";
import { TWISTER } from "../track/tracks/twister";
import { getCheckpointSvg } from "../track/checkpoint-render";

export type GameState = 'title' | 'track' | 'race';

const TITLE_DURATION = 1000;
const PLAY_BUTTON_COLOR = 'rgb(33, 129, 9)';
const GO_BUTTON_COLOR = 'rgb(33, 129, 9)';
const GO_BUTTON_DISABLED_COLOR = 'rgb(107, 119, 104)';

export type GameUiOptions = {
    wireframe?: boolean;
};

export class GameUi {

    private _elem: HTMLElement;
    private _wireframe: boolean;
    private _state: GameState = 'title';
    
    private _titleLayer = this._makeLayer('game-title');
    
    private _trackLayer = this._makeLayer('game-track');
    
    private _raceLayer = this._makeLayer('game-race');
    private _raceUi?: RaceUi;
    
    constructor(elem: HTMLElement, options?: GameUiOptions) {
        this._elem = elem;
        this._wireframe = options?.wireframe ?? false;
        elem.style.setProperty('background-color', 'rgb(29, 29, 29)');
        elem.style.setProperty('color', 'white');
        elem.style.setProperty('font-family', 'sans-serif');

        this._titleLayer.style.setProperty('inset', '0');
        this._titleLayer.style.setProperty('display', 'flex');
        this._titleLayer.style.setProperty('flex-direction', 'column');
        this._titleLayer.style.setProperty('justify-content', 'center');
        this._titleLayer.style.setProperty('align-items', 'center');

        this._trackLayer.style.setProperty('inset', '0');
        this._trackLayer.style.setProperty('display', 'flex');
        this._trackLayer.style.setProperty('flex-direction', 'column');
        this._trackLayer.style.setProperty('margin', '40px');
        this._trackLayer.style.setProperty('gap', '20px');

        this._raceLayer.style.setProperty('inset', '0');

        this._doTitle();

        document.addEventListener('keydown', (event) => this._onKeydown(event));
    }

    get state() {
        return this._state;
    }

    //#region Internal

    private _makeLayer(id: string) {
        const layer = document.createElement('div');
        layer.id = id;
        layer.style.setProperty('position', 'absolute');
        return layer;
    }

    private _onKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this._doTitle();
        }
    }

    private async _doTitle() {
        this._state = 'title';
        this._titleLayer.innerHTML = '';
        this._elem.innerHTML = '';
        this._elem.appendChild(this._titleLayer);

        const title = document.createElement('div');
        title.textContent = 'CLUTCH';
        title.style.setProperty('font-size', '100px');
        title.style.setProperty('font-style', 'italic');
        title.style.setProperty('text-shadow', '0 0 10px rgba(255, 255, 0, 0.75)');
        this._titleLayer.appendChild(title);
        await title.animate([
            { letterSpacing: '6em', paddingRight: '6000px' },
            { letterSpacing: '0', paddingRight: '0' },
        ], TITLE_DURATION).finished;
        await delay(0.25);
        if (this._state !== 'title') {
            return;
        }
        const optionsDiv = document.createElement('div');
        optionsDiv.style.setProperty('position', 'relative');
        optionsDiv.style.setProperty('height', '0');
        const playButton = document.createElement('button');
        playButton.textContent = 'PLAY';
        playButton.style.setProperty('font-size', '30px');
        playButton.style.setProperty('border', '1px solid rgb(255, 255, 255)');
        playButton.style.setProperty('cursor', 'pointer');
        playButton.style.setProperty('background-color', PLAY_BUTTON_COLOR);
        playButton.style.setProperty('color', 'white');
        playButton.style.setProperty('padding', '5px 20px');
        playButton.style.setProperty('margin-top', '20px');
        playButton.addEventListener('mouseenter', () => {
            playButton.style.setProperty('filter', 'brightness(1.2)');
        });
        playButton.addEventListener('mouseleave', () => {
            playButton.style.setProperty('filter', 'brightness(1)');
        });
        playButton.addEventListener('click', () => {
            this._doTrack();
        });
        optionsDiv.appendChild(playButton);
        this._titleLayer.appendChild(optionsDiv);
    }

    private _doTrack() {
        this._state = 'track';
        this._trackLayer.innerHTML = '';
        this._elem.innerHTML = '';
        this._elem.appendChild(this._trackLayer);

        this._trackLayer.animate([
            { opacity: 0 },
            { opacity: 1 },
        ], { duration: 400 });

        const instruction = document.createElement('div');
        instruction.textContent = 'CHOOSE A TRACK';
        instruction.style.setProperty('text-align', 'center');
        instruction.style.setProperty('font-size', '60px');
        instruction.style.setProperty('font-style', 'italic');
        instruction.style.setProperty('text-shadow', '0 0 6px rgba(255, 255, 0, 0.75)');
        this._trackLayer.appendChild(instruction);

        const split = document.createElement('div');
        split.style.setProperty('display', 'flex');
        split.style.setProperty('flex-direction', 'row');
        split.style.setProperty('justify-content', 'center');
        split.style.setProperty('align-items', 'center');
        split.style.setProperty('flex', '1');
        this._trackLayer.appendChild(split);

        const listSide = document.createElement('div');
        listSide.style.setProperty('display', 'flex');
        listSide.style.setProperty('flex-direction', 'column');
        listSide.style.setProperty('justify-content', 'center');
        listSide.style.setProperty('align-items', 'center');
        split.appendChild(listSide);

        const select = document.createElement('select');
        select.setAttribute('size', '10');
        select.style.setProperty('font-size', '20px');
        select.style.setProperty('margin', '10px');
        listSide.appendChild(select);

        const tracks = [
            { name: 'Dogbone', track: DOGBONE },
            { name: 'Caterpillar', track: CATERPILLAR},
            { name: 'Twister', track: TWISTER},
        ];
        for (const track of tracks) {
            const option = document.createElement('option');
            option.textContent = track.name;
            select.appendChild(option);
        }

        const goButton = document.createElement('button');
        goButton.textContent = 'GO';
        goButton.setAttribute('disabled', 'disabled');
        goButton.style.setProperty('opacity', '0.5');
        goButton.style.setProperty('font-size', '30px');
        goButton.style.setProperty('border', '1px solid rgb(255, 255, 255)');
        goButton.style.setProperty('background-color', GO_BUTTON_DISABLED_COLOR);
        goButton.style.setProperty('color', 'white');
        goButton.style.setProperty('padding', '5px 20px');
        goButton.style.setProperty('margin-top', '20px');
        goButton.addEventListener('mouseenter', () => {
            if (!goButton.hasAttribute('disabled')) {
                goButton.style.setProperty('filter', 'brightness(1.2)');
            }
        });
        goButton.addEventListener('mouseleave', () => {
            goButton.style.setProperty('filter', 'brightness(1)');
        });
        listSide.appendChild(goButton);

        const previewSide = document.createElement('div');
        previewSide.style.setProperty('display', 'flex');
        previewSide.style.setProperty('flex-direction', 'column');
        previewSide.style.setProperty('justify-content', 'center');
        previewSide.style.setProperty('align-items', 'center');
        previewSide.style.setProperty('flex', '1');
        split.appendChild(previewSide);

        const preview = document.createElement('div');
        previewSide.appendChild(preview);

        select.addEventListener('change', () => {
            goButton.removeAttribute('disabled');
            goButton.style.setProperty('cursor', 'pointer');
            goButton.style.setProperty('background-color', GO_BUTTON_COLOR);
            goButton.style.setProperty('opacity', '1');
            const track = tracks[select.selectedIndex].track;
            preview.innerHTML = '';
            const scale = 600 / Math.max(track.size.width, track.size.height) / TILE_SIZE;
            preview.style.setProperty('width', `${track.size.width * TILE_SIZE * scale}px`);
            preview.style.setProperty('height', `${track.size.height * TILE_SIZE * scale}px`);
            const previewInner = document.createElement('div');
            previewInner.style.setProperty('width', `${track.size.width * TILE_SIZE}px`);
            previewInner.style.setProperty('height', `${track.size.height * TILE_SIZE}px`);
            previewInner.style.setProperty('transform', `scale(${scale})`);
            previewInner.style.setProperty('transform-origin', '0 0');
            preview.appendChild(previewInner);
            
            for (const offset of new Size().copyFrom(track.size).offsets()) {
                const tile = track.getTile(offset.x, offset.y);
                const svg = getTileSvg(document, tile);
                if (svg) {
                    svg.style.setProperty('position', 'absolute');
                    svg.style.setProperty('left', `${TILE_SIZE * (offset.x - 0.5)}px`);
                    svg.style.setProperty('top', `${TILE_SIZE * (offset.y - 0.5)}px`);
                    previewInner.appendChild(svg);
                }
            }
            const start = track.start;
            const startOffset = start.tile.offset;
            const startSvg = getCheckpointSvg(document, start, 'start');
            startSvg.style.setProperty('position', 'absolute');
            startSvg.style.setProperty('left', `${TILE_SIZE * (startOffset.x - 0.5)}px`);
            startSvg.style.setProperty('top', `${TILE_SIZE * (startOffset.y - 0.5)}px`);
            previewInner.appendChild(startSvg);
        });
        goButton.addEventListener('click', () => {
            const track = tracks[select.selectedIndex].track;
            this._doRace(track);
        });

    }

    private _doRace(track: Track) {
        this._state = 'race';
        this._raceLayer.innerHTML = '';
        this._elem.innerHTML = '';
        this._elem.appendChild(this._raceLayer);

        this._raceLayer.animate([
            { opacity: 0 },
            { opacity: 1 },
        ], { duration: 400 });

        const race = new Race(track, [
            { type: getStandardCarType(0), ai: undefined },
            { type: getStandardCarType(1), ai: { speed: 0.7 } },
            { type: getStandardCarType(2), ai: { speed: 0.8 } },
            { type: getStandardCarType(3), ai: { speed: 0.9 } },
            { type: getStandardCarType(4), ai: { speed: 1.0 } },
        ], 3);
        const raceUi = new RaceUi(this._raceLayer, race, { wireframe: this._wireframe });
        this._raceUi = raceUi
        
        const tick = (sec: number) => {
            race.tick(sec);
            if (this._raceUi) {
                this._raceUi.tick(sec);
                this._raceUi.update();
            }
        };
        
        let lastTime = -1;
        const rafCallback = (time: number) => {
            if (this._state !== 'race' || this._raceUi !== raceUi) {
                return;
            }
            if (lastTime < 0) {
                lastTime = time;
            } else {
                try {
                    tick(Math.min(time - lastTime, 16.666) / 1000);
                } catch (e) {
                    console.error(e);
                }
                lastTime = time;
            }
            requestAnimationFrame(rafCallback);
        };
        requestAnimationFrame(rafCallback);
    }

    //#endregion
}