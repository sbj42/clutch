import { Difficulty, Race } from "../race/race";
import { Track } from "../track/track";
import { RaceUi } from "./race-ui";
import { titleUi } from "./game-title-ui";
import { setupUi } from "./game-setup-ui";
import { pauseUi } from "./game-pause-ui";
import { resultsUi } from "./game-results-ui";
import { makeLayer } from "../ui/ui";
import { optionsUi } from "./game-options-ui";
import { loadOptions } from "./options";

export type GameState = 'title' | 'options' | 'setup' | 'race';

const NUM_LAPS = 3;

export type GameUiOptions = {
    wireframe?: boolean;
};

export class GameUi {
    raceUi?: RaceUi;

    private _elem: HTMLElement;
    private _wireframe: boolean;
    private _state: GameState = 'title';
    
    private _titleLayer = makeLayer('game-title');
    private _optionsLayer = makeLayer('game-options');
    private _setupLayer = makeLayer('game-setup');
    private _raceLayer = makeLayer('game-race');
    
    private _paused = false;
    private _pauseLayer = makeLayer('game-pause');

    private _results = false;
    private _resultsLayer = makeLayer('game-results');
    
    constructor(elem: HTMLElement, options?: GameUiOptions) {
        this._elem = elem;
        this._wireframe = options?.wireframe ?? false;

        this.doTitle();

        this._raceLayer.classList.add('fill');

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
        this._elem.innerHTML = '';
        this._elem.appendChild(this._titleLayer);

        titleUi(this, this._titleLayer);
    }

    doOptions() {
        this._state = 'options';
        this._stopRace();
        this._elem.innerHTML = '';
        this._elem.appendChild(this._optionsLayer);

        optionsUi(this, this._optionsLayer);
    }

    doSetup() {
        this._state = 'setup';
        this._stopRace();
        this._elem.innerHTML = '';
        this._elem.appendChild(this._setupLayer);

        setupUi(this, this._setupLayer);
    }

    doRace(track: Track, difficulty: Difficulty) {
        this._state = 'race';
        this._stopRace();
        this._elem.innerHTML = '';
        this._elem.appendChild(this._raceLayer);

        this._raceLayer.animate([
            { opacity: 0 },
            { opacity: 1 },
        ], { duration: 400 });

        const race = new Race(track, NUM_LAPS, difficulty);

        this._raceLoop(race);
    }

    doPause(pause: boolean) {
        this._paused = pause;
        this.raceUi?.audio.pause(pause);
        if (!this._paused) {
            this._pauseLayer.remove();
            return;
        }
        this._pauseLayer.innerHTML = '';
        this._elem.appendChild(this._pauseLayer);

        pauseUi(this, this._pauseLayer);
    }

    doResults() {
        this._results = true;
        this.raceUi?.audio.quiet();
        this._resultsLayer.innerHTML = '';
        this._elem.appendChild(this._resultsLayer);

        resultsUi(this, this._resultsLayer);
    }

    //#region Internal

    private _onKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            if (this._state === 'setup' || this._state === 'options') {
                this.doTitle();
            } else if (this._state === 'race') {
                if (this.raceUi?.race.state !== 'finished') {
                    this.doPause(!this._paused);
                }
            }
        }
    }

    private _stopRace() {
        this._results = false;
        this.raceUi?.destroy();
        this.raceUi = undefined;
        this.doPause(false);
    }

    private _raceLoop(race: Race) {
        const raceUi = new RaceUi(this._raceLayer, race, loadOptions(), { wireframe: this._wireframe });
        this.raceUi = raceUi
        const tick = (sec: number) => {
            if (this._paused) {
                return;
            }
            raceUi.race.tick(sec);
            if (this.raceUi) {
                this.raceUi.tick(sec);
                this.raceUi.update();
            }
            if (!this._results && raceUi.race.state === 'finished') {
                this.doResults()
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

    //#endregion
}
