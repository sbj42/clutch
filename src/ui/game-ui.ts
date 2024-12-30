import { getStandardCarType } from "../race/car-type";
import { Race } from "../race/race";
import { Track } from "../track/track";
import { RaceUi } from "./race-ui";
import { titleUi } from "./game-title-ui";
import { setupUi } from "./game-setup-ui";
import { pauseUi } from "./game-pause-ui";

export type GameState = 'title' | 'setup' | 'race';

export const BACKGROUND_COLOR = 'rgb(29, 29, 29)';
export const GREEN_BUTTON_COLOR = 'rgb(33, 129, 9)';
export const YELLOW_BUTTON_COLOR = 'rgb(129, 117, 9)';
export const RED_BUTTON_COLOR = 'rgb(129, 9, 9)';
export const BUTTON_DISABLED_COLOR = 'rgb(107, 119, 104)';

export type GameUiOptions = {
    wireframe?: boolean;
};

export class GameUi {
    raceUi?: RaceUi;

    private _elem: HTMLElement;
    private _wireframe: boolean;
    private _state: GameState = 'title';
    
    private _titleLayer = this._makeLayer('game-title');
    
    private _trackLayer = this._makeLayer('game-track');
    
    private _raceLayer = this._makeLayer('game-race');
    private _paused = false;

    private _pauseLayer = this._makeLayer('game-pause');
    
    constructor(elem: HTMLElement, options?: GameUiOptions) {
        this._elem = elem;
        this._wireframe = options?.wireframe ?? false;
        elem.style.setProperty('background-color', BACKGROUND_COLOR);
        elem.style.setProperty('color', 'white');
        elem.style.setProperty('font-family', 'sans-serif');

        this.doTitle();

        document.addEventListener('keydown', (event) => this._onKeydown(event));
    }

    get state() {
        return this._state;
    }

    get paused() {
        return this._paused;
    }

    doTitle() {
        this._state = 'title';
        this._stopRace();
        this._titleLayer.innerHTML = '';
        this._elem.innerHTML = '';
        this._elem.appendChild(this._titleLayer);

        titleUi(this, this._titleLayer);
    }

    doSetup() {
        this._state = 'setup';
        this._stopRace();
        this._trackLayer.innerHTML = '';
        this._elem.innerHTML = '';
        this._elem.appendChild(this._trackLayer);

        setupUi(this, this._trackLayer);
    }

    doRace(track: Track) {
        this._state = 'race';
        this._stopRace();
        this._raceLayer.innerHTML = '';
        this._elem.innerHTML = '';
        this._elem.appendChild(this._raceLayer);

        this._raceLayer.style.setProperty('inset', '0');

        this._raceLayer.animate([
            { opacity: 0 },
            { opacity: 1 },
        ], { duration: 400 });

        const race = new Race(track, [
            { type: getStandardCarType(0), ai: undefined },
            { type: getStandardCarType(1), ai: { speed: 0.85 } },
            { type: getStandardCarType(2), ai: { speed: 0.9 } },
            { type: getStandardCarType(3), ai: { speed: 0.95 } },
            { type: getStandardCarType(4), ai: { speed: 1.0 } },
        ], 3);
        const raceUi = new RaceUi(this._raceLayer, race, { wireframe: this._wireframe });
        this.raceUi = raceUi
        
        const tick = (sec: number) => {
            if (this._paused) {
                return;
            }
            race.tick(sec);
            if (this.raceUi) {
                this.raceUi.tick(sec);
                this.raceUi.update();
            }
        };
        
        let lastTime = -1;
        const rafCallback = (time: number) => {
            if (this._state !== 'race' || this.raceUi !== raceUi) {
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

    doPause(pause: boolean) {
        this._paused = pause;
        this.raceUi?.audio.pause(pause);
        if (!this._paused) {
            this._pauseLayer.parentNode?.removeChild(this._pauseLayer);
            return;
        }
        this._pauseLayer.innerHTML = '';
        this._elem.appendChild(this._pauseLayer);

        pauseUi(this, this._pauseLayer);
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
            if (this._state === 'setup') {
                this.doTitle();
            } else if (this._state === 'race') {
                this.doPause(!this._paused);
            }
        }
    }

    private _stopRace() {
        this.raceUi?.destroy();
        this.raceUi = undefined;
        this.doPause(false);
    }

    //#endregion
}

export function makeButton(color: string, text: string, callback: () => void) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.setProperty('font-size', '30px');
    button.style.setProperty('border', '1px solid rgb(255, 255, 255)');
    button.style.setProperty('background-color', color);
    button.style.setProperty('color', 'white');
    button.style.setProperty('padding', '5px 20px');
    button.addEventListener('mouseenter', () => {
        if (!button.hasAttribute('disabled')) {
            button.style.setProperty('filter', 'brightness(1.2)');
        }
    });
    button.addEventListener('mouseleave', () => {
        button.style.setProperty('filter', 'brightness(1)');
    });
    button.addEventListener('click', () => {
        callback();
    });
    return button;
}