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
        let state: CheckpointState = 'inactive';
        if (player.lap === 0) {
            if (this.checkpoint.isStart) {
                state = 'start';
            }
        } else if (index === track.checkpoints.length - 1 && (player.almostFinished || player.finished)) {
            state = 'finish'
        } else if (!player.finished && !this.checkpoint.isStart) {
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
