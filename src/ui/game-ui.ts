import { getStandardCarType } from "../race/car-type";
import { Race } from "../race/race";
import { SMALL1 } from "../track/tracks/small1";
import { delay } from "../util/delay";
import { RaceUi } from "./race-ui";

export type GameState = 'title' | 'race';

const TITLE_DURATION = 1000;
const PLAY_BUTTON_COLOR = 'rgb(33, 129, 9)';

export type GameUiOptions = {
    wireframe?: boolean;
};

export class GameUi {

    private _elem: HTMLElement;
    private _wireframe: boolean;
    private _state: GameState = 'title';
    
    private _titleLayer = this._makeLayer('title');
    
    private _raceLayer = this._makeLayer('race');
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

    private _doRace() {
        this._state = 'race';
        this._raceLayer.innerHTML = '';
        this._elem.innerHTML = '';
        this._elem.appendChild(this._raceLayer);
        this._raceLayer.animate([
            { opacity: 0 },
            { opacity: 1 },
        ], { duration: 400 });

        const track = SMALL1; // LINE1;
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
            this._doRace();
        });
        optionsDiv.appendChild(playButton);
        this._titleLayer.appendChild(optionsDiv);
    }

    //#endregion
}