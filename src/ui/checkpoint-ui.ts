import type { Checkpoint } from "../track/checkpoint";
import { getCheckpointMiniSvg, getCheckpointSvg, type CheckpointState } from "../track/checkpoint-render";
import type { RaceUi } from "./race-ui";

export class CheckpointUi {
    readonly raceUi: RaceUi;
    readonly checkpoint: Checkpoint;
    
    private _container: HTMLElement;
    private _miniContainer: HTMLElement;
    private _lastState?: CheckpointState;
    private _miniScale: number;
    private _wireframe: boolean;

    constructor(raceUi: RaceUi, container: HTMLElement, miniContainer: HTMLElement, checkpoint: Checkpoint, miniScale: number, wireframe: boolean) {
        this.raceUi = raceUi;
        this.checkpoint = checkpoint;
        this._container = container;
        this._miniContainer = miniContainer;
        this._miniScale = miniScale;
        this._wireframe = wireframe;
    }

    update() {
        const index = this.checkpoint.index;
        const track = this.raceUi.race.track;
        const player = this.raceUi.race.player;
        const playerState = player.state;
        let state: CheckpointState = 'inactive';
        if (index === 0 && playerState === 'before-start') {
            state = 'start';
        } else if (index === 0 && playerState === 'finishing') {
            state = 'finish'
        } else if (playerState === 'racing' || playerState === 'finishing') {
            if (player.nextCheckpoint === index) {
                state = 'next';
            } else if (player.nextCheckpoint === (index + 1) % track.checkpoints.length) {
                state = 'last';
            }
        }
        if (state === this._lastState) {
            return;
        }
        this._lastState = state;
        this._container.innerHTML = '';
        this._miniContainer.innerHTML = '';
        const svg = getCheckpointSvg(document, this.checkpoint, state, { wireframe: this._wireframe });
        this._container.appendChild(svg);
        const minisvg = getCheckpointMiniSvg(document, this.checkpoint, state, this._miniScale);
        this._miniContainer.appendChild(minisvg);
    }
}
